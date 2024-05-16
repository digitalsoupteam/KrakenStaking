use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::ErrorCode;
use crate::events::Unstaked;
use crate::states::{LockState, UserConfigState, VaultState};

pub fn unstake(ctx: Context<Unstake>, _args: UnstakeArgs) -> Result<()> {
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
    
}

