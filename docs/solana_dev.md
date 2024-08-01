# Solana dev guide

## Deploy new program

### 1. Prebuild

```shell
acnhor build
```

### 2. Find new program id

```shell
anchor keys list
```

output:

```shell
staking: NEW_IDPfXdbNakE5Eo9RqivYCSoxrSH1vWr4dZHsX5iY
```

### 3. Find legacy program id in ./rograms/staking/src/lib.rs

```rust
declare_id!("LEGACY_IDdbNakE5Eo9RqivYCSoxrSH1vWr4dZHsX5iY");
```

### 4. Replace all legacy program id (ctrl + shift + r)

<span style="color:red">~~LEGACY_IDdbNakE5Eo9RqivYCSoxrSH1vWr4dZHsX5iY~~</span>
<span style="color:green">NEW_IDPfXdbNakE5Eo9RqivYCSoxrSH1vWr4dZHsX5iY</span>

### 5. Build with new program id

```shell
anchor build
```

### 6. Deploy new program

```shell
anchor deploy --provider.cluster devnet
```

### 7. Migrate(initialize) program

```shell
anchor migrate --provider.cluster devnet
```

## Create vault

```shell
anchor run create-vault -- --vault-id=1 --periods=2592000 --periods=7776000 --periods=15552000 --mint=GBAcZ5Ne1fUAc1y83VPL5p3fyt8N9wb5uRDHS2nwHsw5
```
