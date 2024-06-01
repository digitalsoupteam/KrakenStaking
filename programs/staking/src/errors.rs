use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Not admin")]
    NotAdmin,
    #[msg("Vault is paused")]
    VaultIsPaused,
    #[msg("Not eligible to unstake")]
    NotEligible,
    #[msg("Not staker")]
    NotStaker,
    #[msg("Invalid vault id")]
    InvalidVaultId,
    #[msg("Periods is not unique")]
    PeriodsIsNotUnique,
    #[msg("Periods contains zero")]
    PeriodsContainsZero,
    #[msg("Periods is empty")]
    PeriodsIsEmpty,
    #[msg("Invalid vault mint")]
    InvalidVaultMint,
    #[msg("Invalid owner")]
    InvalidOwner,
    #[msg("Invalid lock id")]
    InvalidLockId,
    #[msg("Already unstaked")]
    AlreadyUnstaked,
    #[msg("Invalid referrer")]
    InvalidReferrer,
}
