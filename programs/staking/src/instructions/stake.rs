use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::ErrorCode;
use crate::events::Staked;
use crate::states::{LockState, UserConfigState, VaultState};

pub fn stake(ctx: Context<Stake>, args: StakeArgs) -> Result<()> {
    let vault = &ctx.accounts.vault;

    if ctx.accounts.user_config.last_lock_id == 0 {
        ctx.accounts.user_config.magic = UserConfigState::MAGIC;
    }

    ctx.accounts.user_config.last_lock_id += 1;

    if args.stake_id != ctx.accounts.user_config.last_lock_id {
        return Err(ErrorCode::InvalidLockId.into());
    }

    if !vault.periods.clone().into_iter().any(|x| x == args.period) {
        return Err(ErrorCode::PeriodsIsEmpty.into());
    }

    let user_lock = &mut ctx.accounts.user_lock;
    user_lock.magic = LockState::MAGIC;
    user_lock.id = ctx.accounts.user_config.last_lock_id;
    user_lock.vault = ctx.accounts.vault.key();
    user_lock.staker = ctx.accounts.staker.key();
    user_lock.amount = args.amount;
    user_lock.locked_for = args.period;
    user_lock.locked_at = Clock::get()?.unix_timestamp as u32;

    // transfer from user_token -> vault_token
    anchor_spl::token::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::TransferChecked {
                from: ctx.accounts.user_token.to_account_info(),
                to: ctx.accounts.vault_token.to_account_info(),
                authority: ctx.accounts.staker.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
        ),
        args.amount,
        ctx.accounts.mint.decimals,
    )?;

    emit!(Staked {
        lock: user_lock.key(),
        staker: ctx.accounts.staker.key(),
        amount: args.amount,
        vault: ctx.accounts.vault.key(),
        period: args.period,
        id: user_lock.id,
    });
    Ok(())
}


#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone, Default)]
pub struct StakeArgs {
    pub vault_id: u32,
    pub stake_id: u32,
    pub amount: u64,
    pub period: u32,
}

#[derive(Accounts)]
#[instruction(vault_id: u32, stake_id: u32)]
pub struct Stake<'info> {
    #[account(mut)]
    pub staker: Signer<'info>,

    #[account(
        init,
        payer = staker,
        space = 8 + LockState::MAX_SIZE,
        seeds = [LockState::SEED, staker.key().as_ref(), stake_id.to_le_bytes().as_ref()],
        bump
    )]
    pub user_lock: Box<Account<'info, LockState>>,

    #[account(
        seeds = [VaultState::SEED, vault_id.to_le_bytes().as_ref()],
        constraint = vault_id == vault.id @ ErrorCode::InvalidVaultId, 
        constraint = vault.paused == false @ ErrorCode::VaultIsPaused,
        has_one = mint,
        bump
    )]
    pub vault: Box<Account<'info, VaultState>>,

    #[account(
        init_if_needed,
        payer = staker,
        space = 8 + UserConfigState::MAX_SIZE,
        seeds = [UserConfigState::SEED, staker.key().as_ref()],
        bump
    )]
    pub user_config: Box<Account<'info, UserConfigState>>,

    #[account(
        mut,
        constraint = user_token.mint == vault.mint @ ErrorCode::InvalidVaultMint,
        constraint = user_token.owner == staker.key() @ ErrorCode::InvalidOwner
    )]
    pub user_token: Box<Account<'info, TokenAccount>>,

    #[account(mint::token_program = Token::id())]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = staker,
        associated_token::mint = mint,
        associated_token::authority = vault,
        constraint = vault_token.owner == vault.key(),
        has_one = mint
    )]
    pub vault_token: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}

