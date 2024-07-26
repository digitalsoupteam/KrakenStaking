# KRAKEN STAKING PROGRAM API

## Solana program

Before compile project, and copy ./target/idl/staking.json to react app

```shell
anhor build
```

Then create provider and program

```ts
import idl from "./staking.json";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, Idl, AnchorProvider, setProvider } from "@coral-xyz/anchor";

const { connection } = useConnection();
const wallet = useAnchorWallet();

const provider = new AnchorProvider(connection, wallet, {});
setProvider(provider);

const programId = new PublicKey("placeholderHkaQT5AuRYow3HyUv5qWzmhwsCPd653n");
const program = new Program(idl as Idl, programId);
const user = useAnchorWallet();
```

### Stake

Add stake action handler

```ts
const vaultId = Number(user_input(number));
const mint = new PublickKey(user_input(string));
const amount = Number(user_input(number));
const period = Number(user_input(number));
const referrer = new PublickKey(user_input(string)) | null;

const PROGRAM_SEED = Buffer.from("program_state");
const USER_SEED = Buffer.from("user_config");
const VAULT_SEED = Buffer.from("vault");
const LOCK_SEED = Buffer.from("lock");

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
const stakeId = await(async () => {
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
        referrer,
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
```

### Unstake

Add unstake action handler

```ts
const vaultId = Number(user_input(number));
const stakeId = Number(user_input(number));
const mint = new PublickKey(user_input(string));

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
const [stakePDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [
        LOCK_SEED,
        user.publicKey.toBuffer(),
        new anchor.BN(stakeId).toBuffer("le", 4),
    ],
    program.programId,
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
    .unstake({
        vaultId,
        stakeId,
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
```

## Server

### Models

#### UserConfig

```ts
{
    account: string;
    lastUpdateAt: number;
    lastUpdateTx: string;
    lastLockId: number;
    referrer?: string;
    stakes: Stake[];
};
```

#### Vault

```ts
{
    account: string;
    lastUpdateAt: number;
    lastUpdateTx: string;
    id: number;
    owner: string;
    mint: string;
    periods: number[];
    paused: boolean;
};
```

#### Stake

```ts
{
    account: string;
    id: number;
    vault: string;
    staker: string;
    config: string;
    amount: number;
    unstakedAt: number;
    lockedFor: number;
    lockedAt: number;
}
```

### Methods

#### GET /user/:publicKey

Get target user info and stakes

```ts
return {
    user: UserConfig,
    stakes: Array<Stake>,
};
```

### GET /users

Get all users info and stakes

```ts
return Array<{
    user: UserConfig;
    stakes: Array<Stake>;
}>;
```

### GET /vault/:publicKey

Get target vault info and stakes

```ts
return {
    vault: Vault,
    stakes: Array<Stake>,
};
```

### GET /vaults

Get all vaults info and stakes

```ts
return Array<{
    vault: Vault;
    stakes: Array<Stake>;
}>;
```
