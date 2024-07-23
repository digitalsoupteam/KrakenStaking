use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::ErrorCode;
use crate::events::Unstaked;
use crate::states::{LockState, UserConfigState, VaultState};

pub fn unstake(ctx: Context<Unstake>, _args: UnstakeArgs) -> Result<()> {
    let user_lock = &mut ctx.accounts.user_lock;
    let now = Clock::get()?.unix_timestamp as u32;
    let deadline = user_lock.locked_at.checked_add(user_lock.locked_for).expect("Overflow");

    if deadline > now {
        return Err(ErrorCode::NotEligible.into());
    }
    user_lock.unstaked_at = now;

    // transfer back from vault_token -> user_token
    anchor_spl::token::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::TransferChecked {
                from: ctx.accounts.vault_token.to_account_info(),
                to: ctx.accounts.user_token.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
            &[&[
                &VaultState::SEED,
                ctx.accounts.vault.id.to_le_bytes().as_ref(),
                &[ctx.bumps.vault]
            ]]
        ),
        user_lock.amount,
        ctx.accounts.mint.decimals,
    )?;

    emit!(Unstaked {
        lock: user_lock.key(),
        staker: ctx.accounts.staker.key(),
        amount: user_lock.amount,
        vault: ctx.accounts.vault.key(),
        period: user_lock.locked_for,
        id: user_lock.id,
    });
    Ok(())
}


#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone, Default)]
pub struct UnstakeArgs {
    pub vault_id: u32,
    pub stake_id: u32,
}

#[derive(Accounts)]
#[instruction(vault_id: u32, stake_id: u32)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub staker: Signer<'info>,

    #[account(
        mut,
        seeds = [LockState::SEED, staker.key().as_ref(), stake_id.to_le_bytes().as_ref()],
        constraint = user_lock.staker == staker.key() @ ErrorCode::InvalidOwner,
        constraint = user_lock.unstaked_at == 0 @ ErrorCode::AlreadyUnstaked,
        has_one = vault,
        has_one = staker,
        bump
    )]
    pub user_lock: Account<'info, LockState>,

    #[account(
        mut,
        seeds = [VaultState::SEED, vault_id.to_le_bytes().as_ref()],
        constraint = vault_id == vault.id @ ErrorCode::InvalidVaultId, 
        constraint = vault.paused == false @ ErrorCode::VaultIsPaused,
        has_one = mint,
        bump
    )]
    pub vault: Account<'info, VaultState>,

    #[account(
        seeds = [UserConfigState::SEED, staker.key().as_ref()],
        bump
    )]
    pub user_config: Account<'info, UserConfigState>,

    #[account(
        mut,
        constraint = user_token.owner == staker.key() @ ErrorCode::InvalidOwner,
        has_one = mint @ ErrorCode::InvalidVaultMint,
    )]
    pub user_token: Account<'info, TokenAccount>,

    #[account(mint::token_program = Token::id())]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = vault_token.owner == vault.key(),
        has_one = mint
    )]
    pub vault_token: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}

