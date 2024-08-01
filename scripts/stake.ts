import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { Staking } from "../app/src/idl/staking";

dotenv.config({ path: ".env", debug: true });

const PROGRAM_SEED = Buffer.from("program_state");
const USER_SEED = Buffer.from("user_config");
const VAULT_SEED = Buffer.from("vault");
const LOCK_SEED = Buffer.from("lock");

async function run(): Promise<void> {
    const argv = await yargs(hideBin(process.argv))
        .options({
            vaultId: { type: "number" },
            mint: { type: "string" },
            amount: { type: "number" },
            period: {
                type: "number",
            },
        })
        .parse();
    const { vaultId, period, amount } = argv;
    const user = loadKeypair(process.env.USER_KEY_PATH!);
    const mint = new PublicKey(argv.mint);
    const ANCHOR_PROVIDER_URL = process.env.CLUSTER_URL!;

    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(ANCHOR_PROVIDER_URL),
        new anchor.Wallet(user),
        anchor.AnchorProvider.defaultOptions(),
    );
    anchor.setProvider(provider);
    const program = anchor.workspace.Staking as anchor.Program<Staking>;

    console.log("Admin: " + user.publicKey.toBase58());
    console.log("Mint: " + mint.toBase58());
    const [programPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [PROGRAM_SEED],
        program.programId,
    );
    const [vaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [VAULT_SEED, new anchor.BN(vaultId).toBuffer("le", 4)],
        program.programId,
    );
    const [userPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [USER_SEED, user.publicKey.toBuffer()],
        program.programId,
    );
    const stakeId = await (async () => {
        try {
            const state = await program.account.userConfigState.fetch(userPDA);
            return state.lastLockId + 1;
        } catch (e) {
            return 1;
        }
    })();
    const [stakePDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [
            LOCK_SEED,
            user.publicKey.toBuffer(),
            new anchor.BN(stakeId).toBuffer("le", 4),
        ],
        program.programId,
    );

    console.log(
        "Create vault " +
            vaultPDA.toBase58() +
            " using " +
            user.publicKey.toBase58() +
            " in " +
            programPDA.toBase58(),
    );

    const accounts = {
        staker: user.publicKey,
        vault: vaultPDA,
        state: programPDA,
        userLock: stakePDA,
        userToken: getAssociatedTokenAddressSync(mint, user.publicKey, true),
        vaultToken: getAssociatedTokenAddressSync(mint, vaultPDA, true),
        userConfig: userPDA,
        mint: mint,
    };

    const builder = program.methods
        .stake({
            vaultId,
            stakeId,
            amount: new anchor.BN(amount),
            period,
            referrer: null,
        })
        .accounts(accounts)
        .signers([user]);

    try {
        const signature = await builder.rpc({ commitment: "confirmed" });
        const receipt = await provider.connection.getTransaction(signature, {
            commitment: "confirmed",
        });
        console.log(receipt);
    } catch (e) {
        console.log("Error on initialize: ", e);
        throw e;
    }
}

function loadKeypair(path: string): Keypair {
    const secretKey = JSON.parse(fs.readFileSync(path, { encoding: "utf8" }));
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

run().catch((err) => {
    console.error(err);
});
