use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::ErrorCode;
use crate::events::Staked;
use crate::states::{LockState, UserConfigState, VaultState};

pub fn stake(ctx: Context<Stake>, args: StakeArgs) -> Result<()> {
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
    
}

