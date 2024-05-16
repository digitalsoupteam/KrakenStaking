use anchor_lang::prelude::*;

use crate::states::ProgramState;

pub fn initialize(ctx: Context<Initialize>, args: InitializeArgs) -> Result<()> {
   
    Ok(())
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone, Default)]
pub struct InitializeArgs {
    pub admin: Pubkey,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
   
}

