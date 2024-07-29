import * as anchor from "@coral-xyz/anchor";
import { Stake, Staking, UserConfig, Vault } from "./types";
import { AccountNames, getAccountNameFromSeed } from "./utils";

export class Storage {
    private lastVaultId: number;
    private vaults: { [key: string]: Vault } = {};
    private users: { [key: string]: UserConfig } = {};
    private vaultSakes: { [key: string]: { [id: number]: Stake } } = {};
    private userStakes: { [key: string]: { [id: number]: Stake } } = {};
    private program: anchor.Program<Staking>;

    constructor(
        program: anchor.Program<Staking>,
        lastVaultId: number = 0,
        vaults: { [key: string]: Vault } = {},
        users: { [key: string]: UserConfig } = {},
        vaultSakes: { [key: string]: { [id: number]: Stake } } = {},
        userStakes: { [key: string]: { [id: number]: Stake } } = {},
    ) {
        this.lastVaultId = lastVaultId;
        this.vaults = vaults;
        this.users = users;
        this.vaultSakes = vaultSakes;
        this.userStakes = userStakes;
        this.program = program;
    }

    public clone() {
        return new Storage(
            this.program,
            this.lastVaultId,
            this.vaults,
            this.users,
            this.vaultSakes,
            this.userStakes,
        );
    }

    public getUser(user: string) {
        console.log(`GetUser ${user}`);
        if (!this.userStakes[user]) {
            return null;
        }
        return {
            user: this.users[user],
            stakes: Object.fromEntries(
                Object.entries(this.userStakes[user]).map(([id, stake]) => [
                    id,
                    { vault: this.vaults[stake.vault], ...stake },
                ]),
            ),
        };
    }

    public async getUsers() {
        return Object.keys(this.users).map((user) => this.getUser(user));
    }

    public async getLastVaultId() {
        return this.lastVaultId;
    }

    public getVault(vault: string) {
        return {
            vault: this.vaults[vault],
            stakes: Object.fromEntries(
                Object.entries(this.vaultSakes[vault]).map(([id, stake]) => [
                    id,
                    { user: this.users[stake.staker], ...stake },
                ]),
            ),
        };
    }

    public getVaults() {
        return Object.keys(this.vaults).map((vault) => this.getVault(vault));
    }

    async emit<T extends (typeof AccountNames)[number]>(
        name: T,
        account: anchor.web3.KeyedAccountInfo,
        slot?: number,
    ) {
        const accountId = account.accountId.toBase58();
        switch (name) {
            case "programState":
                let data = this.program.coder.accounts.decode<
                    anchor.IdlAccounts<Staking>["programState"]
                >(name, account.accountInfo.data);
                console.log(data.admin);
                if (slot || !this.lastVaultId) {
                    console.log(`Update Last Vault Id ${data.lastVaultId}`);
                    this.lastVaultId = data.lastVaultId;
                }
                break;

            case "lockState": {
                let data = this.program.coder.accounts.decode<
                    anchor.IdlAccounts<Staking>["lockState"]
                >(name, account.accountInfo.data);
                let lock = {
                    ...data,
                    staker: data.staker.toBase58(),
                    account: accountId,
                    amount: data.amount.toNumber(),
                    vault: data.vault.toBase58(),
                    config: getAccountNameFromSeed(
                        Buffer.from("user_config"),
                        data.staker,
                        this.program.programId,
                    ).toBase58(),
                };
                let vaultStakes = this.vaultSakes[lock.vault] ?? {};
                let userStakes = this.userStakes[lock.config] ?? {};
                let vaultKey = `${lock.config}:${lock.id}`;
                if (slot || !vaultStakes[vaultKey]) {
                    console.log(`Update Vault Stakes ${lock.vault} ${lock.id}`);
                    vaultStakes[vaultKey] = lock;
                    this.vaultSakes[lock.vault] = vaultStakes;
                }
                if (slot || !userStakes[lock.id]) {
                    console.log(`Update User Stakes ${lock.vault} ${lock.id}`);
                    userStakes[lock.id] = lock;
                    this.userStakes[lock.config] = userStakes;
                }
                break;
            }

            case "vaultState": {
                let data = this.program.coder.accounts.decode<
                    anchor.IdlAccounts<Staking>["vaultState"]
                >(name, account.accountInfo.data);
                if (slot || !this.vaults[accountId]) {
                    console.log(`Update vaultState ${accountId}`);
                    this.vaults[accountId] = {
                        ...data,
                        account: accountId,
                        owner: data.owner.toBase58(),
                        mint: data.mint.toBase58(),
                    };
                }
                break;
            }

            case "userConfigState": {
                let data = this.program.coder.accounts.decode<
                    anchor.IdlAccounts<Staking>["userConfigState"]
                >(name, account.accountInfo.data);
                if (slot || !this.users[accountId]) {
                    console.log(`Update userConfig ${accountId}`);
                    this.users[accountId] = {
                        lastLockId: data.lastLockId,
                        referrer: data.referrer?.toBase58(),
                        account: accountId,
                    };
                }
                break;
            }

            default:
                break;
        }
    }
}
