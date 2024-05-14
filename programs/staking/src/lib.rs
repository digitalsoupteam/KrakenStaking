use anchor_lang::prelude::*;
pub mod errors;
pub mod events;
pub mod helpers;
pub mod instructions;
pub mod states;

use instructions::*;

declare_id!("8jQ519dZStwEm7x6cspozH5Cm8Uxo8Ht1ePWDbaW4qHu");

#[program]
pub mod staking {
    use super::*;
}
