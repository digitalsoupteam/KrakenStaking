import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config({ path: ".env", debug: true });

async function run(provider: anchor.Provider): Promise<void> {
    anchor.setProvider(provider);
    const program = anchor.workspace.Staking as anchor.Program;
    const admin = new PublicKey(process.env.ADMIN_ADDRESS!);

    const builder = program.methods.initialize({
        admin: admin,
    });
    console.log("Initializing program...");
    try {
        await builder.rpc();
    } catch (e) {
        console.log("Error on initialize", e);
        throw e;
    }

    console.log("Done initializing program!");
}

function loadKeypair(path: string): Keypair {
    const secretKey = JSON.parse(fs.readFileSync(path, { encoding: "utf8" }));
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

module.exports = run;
