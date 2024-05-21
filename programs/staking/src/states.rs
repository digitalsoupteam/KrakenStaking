use std::collections::HashSet;

use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[account]
#[derive(Default, Debug)]
pub struct ProgramState {
    pub admin: Pubkey, // Admin's public key
    pub new_admin: Option<Pubkey>,
    pub last_vault_id: u32,
}

impl ProgramState {
    pub const SEED: &'static [u8] = b"program_state";
    pub const MAX_SIZE: usize = 32 // admin
        + (1 + 32)  // new_admin
        + 4 // last_vault_id
        + 1024 // reserved
    ;
}


#[account]
#[derive(Default, Debug)]
pub struct VaultState {
    pub magic: u32,
    pub id: u32,
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub periods: Vec<u32>,
    pub paused: bool,
}

impl VaultState {
    pub const MAGIC: u32 = 0xdeadbeef;
    pub const SEED: &'static [u8] = b"vault";

    pub fn default() -> Self {
        Self {
            magic: VaultState::MAGIC,
            id: 0,
            owner: Pubkey::default(),
            mint: Pubkey::default(),
            periods: vec![],
            paused: false,
        }
    }

    #[allow(non_snake_case)]
    pub fn MAX_SIZE(size: u64) -> usize { 
        4
        + 4
        + 32 
        + 32
        + (4 + 4 * size as usize)
        + 1
    }

    pub fn is_valid(&self) -> Result<()> {
        let set: HashSet<_> = self.periods.iter().collect();

        if self.magic != VaultState::MAGIC {
            return Err(ErrorCode::InvalidMagic.into());
        }
        if set.len() != self.periods.len() {
            return Err(ErrorCode::PeriodsIsNotUnique.into());
        }
        if self.periods.is_empty() {
            return Err(ErrorCode::PeriodsIsEmpty.into());
        }
        if set.contains(&0) {
            return Err(ErrorCode::PeriodsContainsZero.into());
        }
        Ok(())
    }
}

#[account]
#[derive(Default, Debug)]
pub struct UserConfigState {
    pub magic: u32,
    pub last_lock_id: u32,
}

impl UserConfigState {
    pub const MAGIC: u32 = 0xc0febabe;
    pub const SEED: &'static [u8] = b"user_config";
    pub const MAX_SIZE: usize = 4 // magic
        + 4 // last_id
    ;

    pub fn default() -> Self {
        Self {
            magic: UserConfigState::MAGIC,
            last_lock_id: 0,
        }
    }
}

#[account]
#[derive(Default, Debug)]
pub struct LockState {
    pub magic: u32,
    pub id: u32,
    pub vault: Pubkey,
    pub staker: Pubkey,
    pub amount: u64,
    pub locked_for: u32,
    pub locked_at: u32,
}

impl LockState {
    pub const MAGIC : u32 = 0x1337c0fe;
    pub const SEED: &'static [u8] = b"lock";
    pub const MAX_SIZE: usize = 4 // magic
        + 4 // id
        + 32 // vault
        + 32 // staker
        + 8 // amount
        + 4 // locked_for
        + 4 // locked_at
    ;

    pub fn default() -> Self {
        Self {
            magic: LockState::MAGIC,
            id: 0,
            vault: Pubkey::default(),
            staker: Pubkey::default(),
            amount: 0,
            locked_for: 0,
            locked_at: 0,
        }
    }
}

