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

    pub fn initialize(ctx: Context<Initialize>, args: InitializeArgs) -> Result<()> {
        instructions::initialize(ctx, args)
    }

    pub fn create_vault(ctx: Context<CreateVault>, args: CreateVaultArgs) -> Result<()> {
        instructions::create_vault(ctx, args)
    }

    pub fn pause_vault(ctx: Context<UpdateVault>, args: UpdateVaultArgs) -> Result<()> {
        instructions::pause_vault(ctx, args)
    }

    pub fn unpause_vault(ctx: Context<UpdateVault>, args: UpdateVaultArgs) -> Result<()> {
        instructions::unpause_vault(ctx, args)
    }

    pub fn propose_new_admin(ctx: Context<ProposeNewAdmin>, new_admin: Pubkey) -> Result<()> {
        instructions::propose_new_admin(ctx, new_admin)
    }

    pub fn confirm_new_admin(ctx: Context<ProposeNewAdmin>) -> Result<()> {
        instructions::confirm_new_admin(ctx)
    }

    pub fn stake(ctx: Context<Stake>, args: StakeArgs) -> Result<()> {
        instructions::stake(ctx, args)
    }

    pub fn unstake(ctx: Context<Unstake>, args: UnstakeArgs) -> Result<()> {
        instructions::unstake(ctx, args)
    }
}
