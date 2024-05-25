import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
    createMint,
    mintTo,
    TOKEN_PROGRAM_ID,
    getTokenMetadata,
    tokenMetadataInitializeWithRentTransfer,
    getAssociatedTokenAddressSync,
    approve,
    transfer,
    getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { expect } from "chai";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { Staking } from "../target/types/staking";

chai.use(chaiAsPromised);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const PROGRAM_SEED = Buffer.from("program_state");
const USER_SEED = Buffer.from("user_config");
const VAULT_SEED = Buffer.from("vault");
const LOCK_SEED = Buffer.from("lock");

class Token {
    mint: Keypair;
    owner: Keypair;
    ownerATA: PublicKey;
    program: anchor.Program<Staking>;

    constructor(args: {
        mint: Keypair;
        owner: Keypair;
        ownerATA: PublicKey;
        program: anchor.Program<Staking>;
    }) {
        this.mint = args.mint;
        this.owner = args.owner;
        this.ownerATA = args.ownerATA;
        this.program = args.program;
    }

    static async createToken(
        program: anchor.Program<Staking>,
        owner: Keypair,
        name: string,
        symbol: string,
    ): Promise<Token> {
        console.log("Create token for " + name + "/" + symbol);
        const [programPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [PROGRAM_SEED],
            program.programId,
        );
        const mintKp = new anchor.web3.Keypair();
        const mint = await createMint(
            program.provider.connection,
            owner,
            owner.publicKey,
            null,
            9,
            mintKp,
            { commitment: "confirmed" },
            TOKEN_PROGRAM_ID,
        );
        console.log("Token created: " + mintKp.publicKey.toBase58());

        const programATA = await getOrCreateAssociatedTokenAccount(
            program.provider.connection,
            owner,
            mint,
            programPDA,
            true,
            undefined,
            { commitment: "confirmed" },
        );

        const ownerATA = await getOrCreateAssociatedTokenAccount(
            program.provider.connection,
            owner,
            mint,
            owner.publicKey,
            true,
            undefined,
            { commitment: "confirmed" },
        );

        return new Token({
            owner,
            mint: mintKp,
            ownerATA: ownerATA.address,
            program,
        });
    }

    async mintTo(args: {
        user: Keypair;
        amount: number;
    }): Promise<anchor.web3.TransactionSignature> {
        const userATA = await getOrCreateAssociatedTokenAccount(
            this.program.provider.connection,
            args.user,
            this.mint.publicKey,
            args.user.publicKey,
            true,
            undefined,
            { commitment: "confirmed" },
        );

        console.log(
            `Mint ${args.amount} tokens to ${userATA.address.toBase58()}`,
        );

        return await mintTo(
            this.program.provider.connection,
            this.owner,
            this.mint.publicKey,
            userATA.address,
            this.owner.publicKey,
            args.amount,
            [],
            { commitment: "confirmed" },
            TOKEN_PROGRAM_ID,
        );
    }

    async transferTo(args: {
        sender: Keypair;
        receiver: PublicKey;
        amount: number;
    }): Promise<anchor.web3.TransactionSignature> {
        console.log("Transfer tokens to " + args.receiver.toBase58());
        const senderATA = await getOrCreateAssociatedTokenAccount(
            this.program.provider.connection,
            args.sender,
            this.mint.publicKey,
            args.sender.publicKey,
            true,
            undefined,
            { commitment: "confirmed" },
        );
        const receiverATA = await getOrCreateAssociatedTokenAccount(
            this.program.provider.connection,
            args.sender,
            this.mint.publicKey,
            args.receiver,
            true,
            undefined,
            { commitment: "confirmed" },
        );
        return await transfer(
            this.program.provider.connection,
            args.sender,
            senderATA.address,
            receiverATA.address,
            args.sender,
            args.amount,
            [],
            { commitment: "confirmed" },
            TOKEN_PROGRAM_ID,
        );
    }

    getAccountFor(user: Keypair | PublicKey) {
        if (user instanceof Keypair) {
            user = user.publicKey;
        }
        return getAssociatedTokenAddressSync(this.mint.publicKey, user, true);
    }

    async getBalanceIntFor(user: Keypair | PublicKey) {
        let balance = await this.getBalanceFor(user);
        return Math.floor(
            balance.value.uiAmount * 10 ** balance.value.decimals,
        );
    }

    async getBalanceFor(user: Keypair | PublicKey) {
        if (user instanceof Keypair) {
            user = user.publicKey;
        }
        return await this.program.provider.connection.getTokenAccountBalance(
            this.getAccountFor(user),
        );
    }
}

describe("staking", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const owner = Keypair.generate();
    const user1 = Keypair.generate();
    const user2 = Keypair.generate();
    const user3 = Keypair.generate();
    const user4 = Keypair.generate();
    const user5 = Keypair.generate();
    let token1: Token = null;
    let token2: Token = null;

    const program = anchor.workspace.Staking as anchor.Program<Staking>;

    type Event = anchor.IdlEvents<(typeof program)["idl"]>;
    const getEvent = async <E extends keyof Event>(
        eventName: E,
        fn: Promise<anchor.web3.TransactionResponse>,
    ) => {
        let listenerId: number;
        const event = await new Promise<Event[E]>(async (res) => {
            listenerId = program.addEventListener(eventName, async (event) => {
                res(event);
            });
            await fn;
        });
        await program.removeEventListener(listenerId);
        return event;
    };

    const airdrop = async (user, lamports) => {
        console.log("Airdrop " + user.publicKey.toBase58() + " " + lamports);
        const airdropSignature = await provider.connection.requestAirdrop(
            user.publicKey,
            lamports,
        );

        await provider.connection.confirmTransaction(airdropSignature);
    };

    const [programPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [PROGRAM_SEED],
        program.programId,
    );

    const initialize = async (args: { admin: Keypair }) => {
        console.log(
            "Initialize " +
                args.admin.publicKey.toBase58() +
                " in " +
                programPDA.toBase58(),
        );
        console.log("State: " + programPDA.toBase58());
        const accounts = {
            signer: args.admin.publicKey,
        };
        const builder = program.methods
            .initialize({
                admin: args.admin.publicKey,
            })
            .accounts(accounts)
            .signers([args.admin]);
        try {
            const signature = await builder.rpc({ commitment: "confirmed" });
            const receipt = await provider.connection.getTransaction(
                signature,
                {
                    commitment: "confirmed",
                },
            );
            return receipt;
        } catch (e) {
            console.log("Error on initialize: ", e);
            throw e;
        }
    };

    const createVault = async (args: {
        admin: Keypair;
        token: Token;
        vaultId: number;
        periods: number[];
    }) => {
        const [vaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [VAULT_SEED, new anchor.BN(args.vaultId).toBuffer("le", 4)],
            program.programId,
        );
        console.log(`Create vault ${vaultPDA.toBase58()} (${args.vaultId})`);
        const accounts = {
            signer: args.admin.publicKey,
            vault: vaultPDA,
            vaultToken: args.token.getAccountFor(vaultPDA),
            state: programPDA,
            mint: args.token.mint.publicKey,
        };
        const builder = program.methods
            .createVault({
                vaultId: args.vaultId,
                periods: args.periods,
            })
            .accounts(accounts)
            .signers([args.admin]);

        try {
            const signature = await builder.rpc({ commitment: "confirmed" });
            const receipt = await provider.connection.getTransaction(
                signature,
                {
                    commitment: "confirmed",
                },
            );
            return receipt;
        } catch (e) {
            console.log("Error on initialize: ", e);
            throw e;
        }
    };

    const pauseOrResumeVault = async (args: {
        newState: boolean;
        admin: Keypair;
        vaultId: number;
    }) => {
        const [vaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [VAULT_SEED, new anchor.BN(args.vaultId).toBuffer("le", 4)],
            program.programId,
        );
        console.log(`Pause vault ${vaultPDA.toBase58()} (${args.vaultId})`);
        const accounts = {
            signer: args.admin.publicKey,
            vault: vaultPDA,
            state: programPDA,
        };
        const builder = (
            args.newState
                ? program.methods.unpauseVault
                : program.methods.pauseVault
        )({
            vaultId: args.vaultId,
        })
            .accounts(accounts)
            .signers([args.admin]);

        try {
            const signature = await builder.rpc({ commitment: "confirmed" });
            const receipt = await provider.connection.getTransaction(
                signature,
                {
                    commitment: "confirmed",
                },
            );
            return receipt;
        } catch (e) {
            console.log("Error on initialize: ", e);
            throw e;
        }
    };

    const stake = async (args: {
        user: Keypair;
        token: Token;
        vaultId: number;
        stakeId: number;
        period: number;
        amount: number;
    }) => {
        const [vaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [VAULT_SEED, new anchor.BN(args.vaultId).toBuffer("le", 4)],
            program.programId,
        );

        const [stakePDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                LOCK_SEED,
                args.user.publicKey.toBuffer(),
                new anchor.BN(args.stakeId).toBuffer("le", 4),
            ],
            program.programId,
        );

        const [userConfigPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [USER_SEED, args.user.publicKey.toBuffer()],
            program.programId,
        );

        console.log(
            `Stake ${args.amount} ${args.token.mint.publicKey} tokens to ${vaultPDA.toBase58()}`,
        );

        const accounts = {
            staker: args.user.publicKey,
            vault: vaultPDA,
            state: programPDA,
            userLock: stakePDA,
            userConfig: userConfigPDA,
            userToken: args.token.getAccountFor(args.user.publicKey),
            vaultToken: args.token.getAccountFor(vaultPDA),
            mint: args.token.mint.publicKey,
        };
        const builder = program.methods
            .stake({
                amount: new anchor.BN(args.amount),
                vaultId: args.vaultId,
                stakeId: args.stakeId,
                period: args.period,
            })
            .accounts(accounts)
            .signers([args.user]);

        try {
            const signature = await builder.rpc({ commitment: "confirmed" });
            const receipt = await provider.connection.getTransaction(
                signature,
                {
                    commitment: "confirmed",
                },
            );
            return receipt;
        } catch (e) {
            console.log("Error on initialize: ", e);
            throw e;
        }
    };

    const unstake = async (args: {
        user: Keypair;
        token: Token;
        vaultId: number;
        stakeId: number;
    }) => {
        const [vaultPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [VAULT_SEED, new anchor.BN(args.vaultId).toBuffer("le", 4)],
            program.programId,
        );

        const [stakePDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                LOCK_SEED,
                args.user.publicKey.toBuffer(),
                new anchor.BN(args.stakeId).toBuffer("le", 4),
            ],
            program.programId,
        );

        const [userConfigPDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [USER_SEED, args.user.publicKey.toBuffer()],
            program.programId,
        );

        console.log(
            `Unstake ${args.token.mint.publicKey} tokens from ${vaultPDA.toBase58()}`,
        );

        const accounts = {
            staker: args.user.publicKey,
            vault: vaultPDA,
            state: programPDA,
            userLock: stakePDA,
            userToken: args.token.getAccountFor(args.user.publicKey),
            vaultToken: args.token.getAccountFor(vaultPDA),
            userConfig: userConfigPDA,
            mint: args.token.mint.publicKey,
        };
        const builder = program.methods
            .unstake({
                vaultId: args.vaultId,
                stakeId: args.stakeId,
            })
            .accounts(accounts)
            .signers([args.user]);

        try {
            const signature = await builder.rpc({ commitment: "confirmed" });
            const receipt = await provider.connection.getTransaction(
                signature,
                {
                    commitment: "confirmed",
                },
            );
            return receipt;
        } catch (e) {
            console.log("Error on initialize: ", e);
            throw e;
        }
    };

    before(async () => {
        await Promise.all([
            airdrop(owner, 10 * anchor.web3.LAMPORTS_PER_SOL),
            airdrop(user1, 10 * anchor.web3.LAMPORTS_PER_SOL),
            airdrop(user2, 10 * anchor.web3.LAMPORTS_PER_SOL),
            airdrop(user3, 10 * anchor.web3.LAMPORTS_PER_SOL),
            airdrop(user4, 10 * anchor.web3.LAMPORTS_PER_SOL),
            airdrop(user5, 10 * anchor.web3.LAMPORTS_PER_SOL),
        ]);
        [token1, token2] = await Promise.all([
            Token.createToken(program, owner, "Token #1", "TST1"),
            Token.createToken(program, owner, "Token #2", "TST2"),
        ]);
        await token1.mintTo({ user: owner, amount: 1024_000_000_000 });
    });

});
