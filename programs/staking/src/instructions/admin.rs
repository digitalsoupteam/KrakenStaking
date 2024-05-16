use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::states::ProgramState;

pub fn propose_new_admin(ctx: Context<ProposeNewAdmin>, new_admin: Pubkey) -> Result<()> {
    Ok(())
}

pub fn confirm_new_admin(ctx: Context<ProposeNewAdmin>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct ProposeNewAdmin<'info> {
  
}

#[derive(Accounts)]
pub struct ConfirmNewAdmin<'info> {
  
}
