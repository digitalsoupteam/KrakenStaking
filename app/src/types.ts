import { type Staking as Program } from "./idl/staking";
export type Staking = Program;
export type Stake = {
    account: string;
    id: number;
    vault: string;
    staker: string;
    config: string;
    amount: number;
    unstakedAt: number;
    lockedFor: number;
    lockedAt: number;
};

export type Vault = {
    account: string;
    id: number;
    owner: string;
    mint: string;
    periods: number[];
    paused: boolean;
};

export type UserConfig = {
    account: string;
    lastLockId: number;
    referrer?: string;
};
