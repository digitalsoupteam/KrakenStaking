use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Not admin")]
    NotAdmin,
}
