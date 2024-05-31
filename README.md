# KRAKEN STAKING PROGRAM

KRAKEN and derivatives staking program with airdrop rewards

## Dev guide

### Install dependencies

```shell
yarn install
```

### Deploy to devnet

Deploy the program code in a test development environment

```shell
anchor build
```

```shell
anchor deploy --provider.cluster devnet
```

```shell
anchor migrate --provider.cluster devnet
```

### Create vault

Administrator creates a vault for a new token

```shell
anchor run create-vault -- --vault-id=1 --periods=2592000 --periods=7776000 --periods=15552000 --mint=A7rCWbzUD22fUpv3N8f6tfjhMBHFCMAND7g8ViM2ieJh
```

```shell
solana program set-upgrade-authority <PROGRAM_ADDRESS> --new-upgrade-authority <NEW_UPGRADE_AUTHORITY>
```
