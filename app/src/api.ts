import express from "express";
import { PublicKey } from "@solana/web3.js";
import { Indexer } from "./indexer";
import { getAccountNameFromSeed } from "./utils";

export async function createApp(
    indexer: Indexer,
): Promise<express.Application> {
    const app = express();

    // Обработчики маршрутов
    app.get("/user/:publicKey", async (req, res) => {
        try {
            const userPublicKey = new PublicKey(req.params.publicKey as string);
            const userConfigAddress = getAccountNameFromSeed(
                Buffer.from("user_config"),
                userPublicKey,
                indexer.program.programId,
            );
            res.json(indexer.storage.getUser(userConfigAddress.toBase58()));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/users", async (req, res) => {
        try {
            res.json(await indexer.storage.getUsers());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/vault/:publicKey", async (req, res) => {
        try {
            const vaultPublicKey = new PublicKey(
                req.params.publicKey as string,
            );
            res.json(indexer.storage.getVault(vaultPublicKey.toBase58()));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/vaults", async (req, res) => {
        try {
            res.json(indexer.storage.getVaults());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/config", async (req, res) => {
        try {
            res.json({
                lastVaultId: indexer.storage.getLastVaultId(),
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    return app;
}
