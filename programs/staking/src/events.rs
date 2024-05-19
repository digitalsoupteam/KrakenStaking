use anchor_lang::prelude::*;

#[event]
pub struct CreatedVault {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub id: u32,
    pub periods: Vec<u32>,
    pub vault: Pubkey,
}