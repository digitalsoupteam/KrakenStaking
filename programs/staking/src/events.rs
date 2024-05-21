use anchor_lang::prelude::*;

#[event]
pub struct CreatedVault {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub id: u32,
    pub periods: Vec<u32>,
    pub vault: Pubkey,
}

#[event]
pub struct PromotedAdmin {
    pub admin: Pubkey,
    pub new_admin: Pubkey,
}

#[event]
pub struct ConfirmedAdmin {
    pub prev_admin: Pubkey,
    pub new_admin: Pubkey,
}

#[event]
pub struct PausedVault {
    pub vault: Pubkey,
}

#[event]
pub struct UnpausedVault {
    pub vault: Pubkey,
}

#[event]
pub struct Staked {
    pub id: u32,
    pub lock: Pubkey,
    pub staker: Pubkey,
    pub amount: u64,
    pub period: u32,
    pub vault: Pubkey,
}

#[event]
pub struct Unstaked {
    pub id: u32,
    pub lock: Pubkey,
    pub staker: Pubkey,
    pub amount: u64,
    pub period: u32,
    pub vault: Pubkey,
}

