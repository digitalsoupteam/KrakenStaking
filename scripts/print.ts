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
            mint: { type: "string", demandOption: true },
        })
        .parse();
    if (!argv.vaultId || !argv.mint) {
        throw new Error("--vault-id=number, --mint=publickey are required");
    }
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Staking as anchor.Program<Staking>;
    const user = new PublicKey(process.env.USER_ADDRESS!);
    const mint = new PublicKey(argv.mint);
    const vaultId = argv.vaultId;

    const [programPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [PROGRAM_SEED],
        program.programId,
    );
    const [user_pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [USER_SEED, user.toBuffer()],
        program.programId,
    );

    const [vaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [VAULT_SEED, new anchor.BN(vaultId).toBuffer("le", 4)],
        program.programId,
    );
    const userATA = getAssociatedTokenAddressSync(mint, user, true);

    console.log("User " + user.toBase58());
    console.log("Mint " + mint.toBase58());
    console.log("Vault " + vaultPDA.toBase58());
    console.log("Program " + program.programId.toBase58());
    console.log("ProgramPDA " + programPDA.toBase58());
    console.log("UserPDA " + user_pda.toBase58());
    console.log("UserATA " + userATA.toBase58());
    let state = await program.account.programState.fetch(programPDA);
    let vaultState = await program.account.vaultState.fetch(vaultPDA);
    let programInfo =
        await program.provider.connection.getAccountInfo(programPDA);
    let vaultInfo = await program.provider.connection.getAccountInfo(vaultPDA);

    console.log("ProgramInfo", JSON.stringify(programInfo));
    console.log("State", JSON.stringify(state, null, 2));

    console.log("VaultInfo", JSON.stringify(vaultInfo));
    console.log("VaultState", JSON.stringify(vaultState, null, 2));

    try {
        let userState = await program.account.userConfigState.fetch(user_pda);
        let userInfo =
            await program.provider.connection.getAccountInfo(user_pda);
        console.log("UserInfo", JSON.stringify(userInfo));
        console.log("UserState", JSON.stringify(userState, null, 2));
        const promises = Array.from(
            { length: userState.lastLockId },
            (_, i) => {
                const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
                    [
                        LOCK_SEED,
                        user.toBuffer(),
                        new anchor.BN(i + 1).toBuffer("le", 4),
                    ],
                    program.programId,
                );
                console.log(`Lock#${i + 1} ${pda.toBase58()} address`);
                return program.account.lockState.fetch(pda);
            },
        );

        const locks = await Promise.all(promises);

        for (const lock of locks) {
            console.log(`Lock#${lock.id}`, JSON.stringify(lock, null, 2));
        }
    } catch (e) {
        console.log(e);
        console.log("UserState not found");
    }
}

function loadKeypair(path: string): Keypair {
    const secretKey = JSON.parse(fs.readFileSync(path, { encoding: "utf8" }));
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

run().catch((err) => {
    console.error(err);
});
