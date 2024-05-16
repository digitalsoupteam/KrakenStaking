use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::ErrorCode;
use crate::events::CreatedVault;
use crate::states::{ProgramState, VaultState};

pub fn create_vault(ctx: Context<CreateVault>, args: CreateVaultArgs) -> Result<()> {
    Ok(())
}

pub fn pause_vault(ctx: Context<UpdateVault>, _args: UpdateVaultArgs) -> Result<()> {
    Ok(())
}

pub fn unpause_vault(ctx: Context<UpdateVault>, _args: UpdateVaultArgs) -> Result<()> {
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
 
}


#[derive(Accounts)]
#[instruction(vault_id: u32)]
pub struct UpdateVault<'info> {
   
}
