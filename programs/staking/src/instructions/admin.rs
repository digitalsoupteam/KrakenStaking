use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::states::ProgramState;

pub fn propose_new_admin(ctx: Context<ProposeNewAdmin>, new_admin: Pubkey) -> Result<()> {
    let program = &mut ctx.accounts.state;
    program.new_admin = Some(new_admin);
    msg!("Propose new admin: {:?}", new_admin);
    Ok(())
}

pub fn confirm_new_admin(ctx: Context<ProposeNewAdmin>) -> Result<()> {
    let program = &mut ctx.accounts.state;
    program.admin = program.new_admin.unwrap();
    program.new_admin = None;
    msg!("Confirm new admin: {:?}", program.admin);
    Ok(())
}

#[derive(Accounts)]
pub struct ProposeNewAdmin<'info> {
    #[account(
        mut,
        constraint = signer.key() == state.admin @ ErrorCode::NotAdmin
    )]
    pub signer: Signer<'info>,

    #[account(
        seeds = [ProgramState::SEED],
        bump
    )]
    pub state: Account<'info, ProgramState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmNewAdmin<'info> {
    #[account(
        mut,
        constraint = state.new_admin.is_some() && signer.key() == state.new_admin.unwrap() @ ErrorCode::NotAdmin
    )]
    pub signer: Signer<'info>,

    #[account(
        seeds = [ProgramState::SEED],
        bump
    )]
    pub state: Account<'info, ProgramState>,

    pub system_program: Program<'info, System>,
}
