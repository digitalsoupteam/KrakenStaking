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