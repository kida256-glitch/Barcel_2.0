# CELO Escrow Contract Deployment Guide

## Prerequisites

1. **Wallet with Private Key**
   - You need a wallet (MetaMask, etc.) with a private key
   - **NEVER share your private key publicly**

2. **Testnet CELO**
   - Get free testnet CELO from: https://faucet.celo.org/alfajores
   - You need CELO to pay for gas fees

## Deployment Steps

### Step 1: Create `.env` file

Create a `.env` file in the project root with your private key:

```bash
PRIVATE_KEY=0xYourPrivateKeyHere
```

**Important:** 
- Replace `0xYourPrivateKeyHere` with your actual private key
- Never commit this file to Git (it's already in .gitignore)
- Keep your private key secure

### Step 2: Deploy the Contract

Run the deployment script:

```bash
npx hardhat run scripts/deploy-escrow.js --network alfajores
```

### Step 3: Add Contract Address to `.env.local`

After successful deployment, you'll get a contract address. Add it to `.env.local`:

```bash
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0xDeployedContractAddress
```

## Alternative: Deploy via Remix IDE

If you prefer not to use Hardhat locally:

1. Go to https://remix.ethereum.org
2. Create a new file `BarcelEscrow.sol`
3. Copy the contract code from `contracts/BarcelEscrow.sol`
4. Compile with Solidity 0.8.20
5. Connect MetaMask to Celo Alfajores testnet
6. Deploy the contract
7. Copy the deployed address to `.env.local` as `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS`

## Troubleshooting

- **Connection timeout**: Check your internet connection or try again later
- **Insufficient funds**: Make sure you have testnet CELO in your wallet
- **Invalid private key**: Ensure your private key starts with `0x` and is 66 characters long

