import { Connection, clusterApiUrl } from "@solana/web3.js";
import { Indexer } from "./indexer";
import * as api from "./api";
import { fetchWithRetry } from "./utils";
import { once } from "events";
import fs from "fs";
import path from "path";
import https from "https";

async function main() {
    const indexer = Indexer.from(
        new Connection(process.env.CLUSTER_URL ?? clusterApiUrl("devnet"), {
            commitment: "confirmed",
            wsEndpoint: process.env.WS_URL,
            disableRetryOnRateLimit: true,
            fetch: fetchWithRetry,
        }),
    );
    await indexer.run();
    let app = await api.createApp(indexer);
    const PORT = process.env.PORT || 3000;

    // Read SSL certificate and key files
    const options = {
        key: fs.readFileSync(path.join(__dirname, "..", "key.pem")),
        cert: fs.readFileSync(path.join(__dirname, "..", "cert.pem")),
    };

    // Create HTTPS server
    const server = https.createServer(options, app);

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    await once(process, "SIGTERM");
    console.log("Received SIGTERM, shutting down gracefully...");
    server.close(async (err) => {
        if (err) {
            console.error("Error during server shutdown", err);
            process.exit(1);
        }
        process.exit(0);
    });
}

main().catch((err) => {
    console.error(err);
});
