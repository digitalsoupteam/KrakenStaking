import * as anchor from "@coral-xyz/anchor";
import { Connection, Cluster } from "@solana/web3.js";
import { web3 } from "@coral-xyz/anchor";

import IDL from "./idl/staking.json";
import { Staking } from "./types";
import { getType } from "./utils";
import { Storage } from "./storage";

export class Indexer {
    readonly program: anchor.Program<Staking>;
    readonly provider: anchor.AnchorProvider;
    readonly connection: anchor.web3.Connection;
    readonly cluster: Cluster | "localnet";

    private subscriptionId: number | null = null;

    storage: Storage;

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
        this.storage = new Storage(this.program);
    }

    public static from(connection: Connection): Indexer {
        return new Indexer(connection);
    }

    public static local(): Indexer {
        return new Indexer(
            new Connection("http://localhost:8899", "processed"),
        );
    }

    async processAllStates(storage: Storage) {
        console.log("Get All States");
        let pdas = await this.connection.getProgramAccounts(
            this.program.programId,
            {},
        );
        for (let pda of pdas) {
            this.processAccountInfo(
                {
                    accountId: pda.pubkey,
                    accountInfo: pda.account,
                },
                null,
                storage,
            );
        }
    }

    processAccountInfo(
        account: web3.KeyedAccountInfo,
        slot?: number,
        storage?: Storage,
    ) {
        let typeName = getType(account.accountInfo.data);
        if (typeName) {
            (storage || this.storage).emit(typeName, account, slot);
        }
    }

    subscribeOnStatesUpdate() {
        return this.connection.onProgramAccountChange(
            this.program.programId,
            (account, context) =>
                this.processAccountInfo(account, context.slot),
            "processed",
        );
    }

    async load() {
        if (this.subscriptionId) {
            this.connection.removeProgramAccountChangeListener(
                this.subscriptionId,
            );
            this.subscriptionId = null;
        }

        this.subscriptionId = this.subscribeOnStatesUpdate();
        let newStorage = new Storage(this.program);

        let rejectPromise = new Promise((_, reject) => {
            let onTimeout = () => {
                console.warn("No updates in 3 seconds, restarting...");
                reject("Timeout");
                this.load();
            };
            // If no updates in 3 seconds, restart
            let timeout = setTimeout(onTimeout, 3000);
            this.connection.onSlotChange(async () => {
                clearTimeout(timeout);
                timeout = setTimeout(onTimeout, 3000);
            });
        });

        Promise.race([this.processAllStates(newStorage), rejectPromise]).then(
            () => {
                this.storage = newStorage;
            },
        );
    }

    async run() {
        await this.load();
    }
}
