use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::ErrorCode;
use crate::events::CreatedVault;
use crate::states::{ProgramState, VaultState};

pub fn create_vault(ctx: Context<CreateVault>, args: CreateVaultArgs) -> Result<()> {
    ctx.accounts.state.last_vault_id += 1;

    if args.vault_id != ctx.accounts.state.last_vault_id {
        return Err(ErrorCode::InvalidVaultId.into());
    }

    let vault = &mut ctx.accounts.vault;
    vault.magic = VaultState::MAGIC;
    vault.id = args.vault_id;
    vault.owner = ctx.accounts.signer.key();
    vault.mint = ctx.accounts.mint.key();
    vault.periods = args.periods.clone();
    vault.is_valid()?;

    emit!(CreatedVault {
        id: vault.id,
        owner: ctx.accounts.signer.key(),
        mint: ctx.accounts.mint.key(),
        periods: args.periods.clone(),
        vault: ctx.accounts.vault.key(),
    });
    Ok(())
}

pub fn pause_vault(ctx: Context<UpdateVault>, _args: UpdateVaultArgs) -> Result<()> {
    ctx.accounts.vault.paused = true;
    Ok(())
}

pub fn unpause_vault(ctx: Context<UpdateVault>, _args: UpdateVaultArgs) -> Result<()> {
    ctx.accounts.vault.paused = false;
    Ok(())
}


#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone, Default)]
pub struct CreateVaultArgs {
    pub vault_id: u32,
    pub periods: Vec<u32>,
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone, Default)]
pub struct UpdateVaultArgs {
    pub vault_id: u32,
}

#[derive(Accounts)]
#[instruction(vault_id: u32, periods: Vec<u32>)]
pub struct CreateVault<'info> {
    #[account(
        mut,
        constraint = signer.key() == state.admin
    )]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + VaultState::MAX_SIZE(periods.len() as u64), // TODO adjust this
        seeds = [VaultState::SEED, vault_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vault: Account<'info, VaultState>,

    #[account(mut, seeds = [ProgramState::SEED], bump)]
    pub state: Account<'info, ProgramState>,

    #[account(mint::token_program = Token::id())]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = vault,
        constraint = vault_token.mint == mint.key() && vault_token.owner == vault.key()
    )]
    pub vault_token: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(vault_id: u32)]
pub struct UpdateVault<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [VaultState::SEED, vault_id.to_le_bytes().as_ref()],
        bump,
        constraint = vault.owner == signer.key() || signer.key() == state.admin
    )]
    pub vault: Account<'info, VaultState>,

    #[account(seeds = [ProgramState::SEED], bump)]
    pub state: Account<'info, ProgramState>,

    pub system_program: Program<'info, System>,
}
