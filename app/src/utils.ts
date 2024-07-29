import { createHash } from "crypto";
import { PublicKey } from "@solana/web3.js";

export function getAccountNameFromSeed(
    userConfig: Buffer,
    pubKey: PublicKey,
    programId: PublicKey,
): PublicKey {
    const [accountPublicKey] = PublicKey.findProgramAddressSync(
        [userConfig, pubKey.toBuffer()],
        programId,
    );
    return accountPublicKey;
}

export const AccountNames = [
    "programState",
    "lockState",
    "vaultState",
    "userConfigState",
] as const;

export const fetchWithRetry = async (
    input: string | URL | globalThis.Request,
    init: RequestInit | undefined,
    maxRetries = 10,
    delay = 1000,
): Promise<Response> => {
    let retryAttempt = 0;
    while (retryAttempt < maxRetries) {
        try {
            const response = await fetch(input, init);
            if (response.status < 400) return response;
        } catch (error) {
            /* ignore error for retry */
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        retryAttempt++;
    }
    throw new Error("Fetch failed after multiple retry attempts.");
};

export function getType(
    data: Buffer,
): (typeof AccountNames)[number] | undefined {
    const dataFirst8Bytes = data.subarray(0, 8);
    for (const name of AccountNames) {
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
