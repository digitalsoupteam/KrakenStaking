use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Not admin")]
    NotAdmin,
    #[msg("Invalid vault id")]
    InvalidVaultId,
    #[msg("Invalid magic")]
    InvalidMagic,
    #[msg("Periods is not unique")]
    PeriodsIsNotUnique,
    #[msg("Periods contains zero")]
    PeriodsContainsZero,
    #[msg("Periods is empty")]
    PeriodsIsEmpty,
}
