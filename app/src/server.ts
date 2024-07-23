import * as anchor from "@coral-xyz/anchor";
import { createHash } from "crypto";
import express from "express";
import { Connection, PublicKey, clusterApiUrl, Cluster } from "@solana/web3.js";
import { Program, Provider, web3 } from "@coral-xyz/anchor";

import { type Staking } from "./idl/staking";
import IDL from "./idl/staking.json";

type Stake = {
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

type Vault = {
    account: string;
    lastUpdateAt: number;
    lastUpdateTx: string;
    id: number;
    owner: string;
    mint: string;
    periods: number[];
    paused: boolean;
};

type UserConfig = {
    account: string;
    lastUpdateAt: number;
    lastUpdateTx: string;
    lastLockId: number;
    referrer?: string;
    stakes: Stake[];
};

async function getAccountNameFromSeed(
    userConfig: Buffer,
    pubKey: PublicKey,
    programId: PublicKey,
): Promise<PublicKey> {
    const [accountPublicKey, bumpSeed] = await PublicKey.findProgramAddress(
        [userConfig, pubKey.toBuffer()],
        programId,
    );
    return accountPublicKey;
}

export function getType(data: Buffer): string | undefined {
    const names = [
        "programState",
        "lockState",
        "vaultState",
        "userConfigState",
    ];
    const dataFirst8Bytes = data.subarray(0, 8);
    for (const name of names) {
        const discriminator = Buffer.from(
            createHash("sha256")
                .update(`account:${name[0].toUpperCase()}${name.slice(1)}`)
                .digest(),
        ).subarray(0, 8);
        if (dataFirst8Bytes.equals(discriminator)) {
            return name;
        }
    }

    return undefined;
}

export class Indexer {
    readonly program: anchor.Program<Staking>;
    readonly provider: anchor.AnchorProvider;
    readonly connection: anchor.web3.Connection;
    readonly cluster: Cluster | "localnet";

    private subscriptionId: number | null = null;
    private lastVaultId: number;
    private vaults: { [key: string]: Vault } = {};
    private users: { [key: string]: UserConfig } = {};
    private vaultSakes: { [key: string]: { [id: number]: Stake } } = {};
    private userStakes: { [key: string]: { [id: number]: Stake } } = {};

    constructor(connection: anchor.web3.Connection) {
        this.provider = new anchor.AnchorProvider(
            connection,
            {} as anchor.Wallet,
        );
        this.program = new anchor.Program(
            IDL as Staking,
            this.provider,
        ) as anchor.Program<Staking>;
        this.connection = connection;
    }

    public static from(connection: Connection): Indexer {
        return new Indexer(connection);
    }

    public static local(): Indexer {
        return new Indexer(
            new Connection("http://localhost:8899", "processed"),
        );
    }

    public async getUser(user: string) {
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
        return await Promise.all(
            Object.keys(this.users).map(async (user) => {
                return await this.getUser(user);
            }),
        );
    }

    public async getLastVaultId() {
        return this.lastVaultId;
    }

    public getVault(vault: string) {
        console.log(`GetVault ${vault}`);
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
        return Object.keys(this.vaults).map(this.getVault.bind(this));
    }

    async getAllStates() {
        console.log("Get All States");
        let pdas = await this.connection.getProgramAccounts(
            this.program.programId,
            {},
        );
        for (let pda of pdas) {
            await this.processAccountInfo({
                accountId: pda.pubkey,
                accountInfo: pda.account,
            });
        }
    }

    async emit(typeName: string, data: any) {}

    async processAccountInfo(account: web3.KeyedAccountInfo, slot?: number) {
        const accountId = account.accountId.toBase58();
        let typeName = getType(account.accountInfo.data);
        if (typeName) {
            let data = this.program.coder.accounts.decode(
                typeName,
                account.accountInfo.data,
            );
            switch (typeName) {
                case "programState": {
                    if (slot || !this.lastVaultId) {
                        console.log(`Update Last Vault Id ${data.lastVaultId}`);
                        this.lastVaultId = data.lastVaultId;
                        await this.emit(typeName, data);
                    }
                    break;
                }
                case "lockState": {
                    let lock = {
                        ...data,
                        amount: data.amount.toNumber(),
                        vault: data.vault.toBase58(),
                        config: (
                            await getAccountNameFromSeed(
                                Buffer.from("user_config"),
                                data.staker,
                                this.program.programId,
                            )
                        ).toBase58(),
                    };
                    let vaultStakes = this.vaultSakes[lock.vault] ?? {};
                    let userStakes = this.userStakes[lock.config] ?? {};
                    let vaultKey = `${lock.config}:${lock.id}`;
                    if (slot || !vaultStakes[vaultKey]) {
                        console.log(
                            `Update Vault Stakes ${lock.vault} ${lock.id}`,
                        );
                        vaultStakes[vaultKey] = lock;
                        this.vaultSakes[lock.vault] = vaultStakes;
                        await this.emit(typeName, lock);
                    }
                    if (slot || !userStakes[lock.id]) {
                        console.log(
                            `Update User Stakes ${lock.vault} ${lock.id}`,
                        );
                        userStakes[lock.id] = lock;
                        this.userStakes[lock.config] = userStakes;
                        await this.emit(typeName, lock);
                    }
                    break;
                }
                case "vaultState": {
                    if (slot || !this.vaults[accountId]) {
                        console.log(`Update vaultState ${accountId}`);
                        this.vaults[accountId] = {
                            ...data,
                            owner: data.owner.toBase58(),
                            mint: data.mint.toBase58(),
                        };

                        await this.emit(typeName, data);
                    }
                    break;
                }
                case "userConfigState": {
                    if (slot || !this.users[accountId]) {
                        console.log(`Update userConfig ${accountId}`);
                        this.users[accountId] = data;
                        await this.emit(typeName, data);
                    }
                    break;
                }
            }
        }
    }

    subscribeToAccountChanges() {
        return this.connection.onProgramAccountChange(
            this.program.programId,
            async (account, context) => {
                await this.processAccountInfo(account, context.slot);
            },
            "processed",
        );
    }

    async refresh() {
        console.log("refreshing");
        if (this.subscriptionId) {
            this.connection.removeProgramAccountChangeListener(
                this.subscriptionId,
            );
            this.subscriptionId = null;
        }
        this.subscriptionId = this.subscribeToAccountChanges();
        let timeout = setTimeout(() => this.refresh(), 3000);
        this.connection.onSlotChange(async () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.refresh(), 3000);
        });
        await this.getAllStates();
    }

    async run() {
        await this.refresh();
    }
}

async function main() {
    const indexer = Indexer.from(
        new Connection(process.env.CLUSTER_URL ?? clusterApiUrl("devnet")),
    );
    await indexer.run();
    const app = express();

    // Обработчики маршрутов
    app.get("/user/:publicKey", async (req, res) => {
        try {
            const userPublicKey = new PublicKey(req.params.publicKey as string);
            const userConfigAddress = await getAccountNameFromSeed(
                Buffer.from("user_config"),
                userPublicKey,
                indexer.program.programId,
            );
            res.json(await indexer.getUser(userConfigAddress.toBase58()));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/users", async (req, res) => {
        try {
            res.json(await indexer.getUsers());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/vault/:publicKey", async (req, res) => {
        try {
            const vaultPublicKey = new PublicKey(
                req.params.publicKey as string,
            );
            res.json(indexer.getVault(vaultPublicKey.toBase58()));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/vaults", async (req, res) => {
        try {
            res.json(indexer.getVaults());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/config", async (req, res) => {
        try {
            res.json({
                lastVaultId: indexer.getLastVaultId(),
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

main().catch((err) => {
    console.error(err);
});
