use anchor_lang::prelude::*;

use crate::states::ProgramState;

pub fn initialize(ctx: Context<Initialize>, args: InitializeArgs) -> Result<()> {
    let program = &mut ctx.accounts.state;
    program.admin = args.admin;
    msg!(
        "Initialized program state: {:?} (size: {})",
        program,
        ProgramState::MAX_SIZE
    );
    Ok(())
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone, Default)]
pub struct InitializeArgs {
    pub admin: Pubkey,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + ProgramState::MAX_SIZE, // TODO adjust this
        seeds = [ProgramState::SEED],
        bump
    )]
    pub state: Account<'info, ProgramState>,

    pub system_program: Program<'info, System>,
}

