# Smart Contract Integration Guide

## Overview

The Barcel marketplace uses a smart contract deployed on Celo Alfajores testnet to handle payments between buyers and sellers.

## Smart Contract Features

- **Purchase Creation**: When a buyer confirms payment, funds are sent to the contract
- **Purchase Completion**: Seller can complete the purchase to receive funds
- **Secure Escrow**: Funds are held in the contract until seller confirms
- **Transaction Tracking**: All purchases are recorded on-chain

## Deployment Instructions

### Option 1: Using Hardhat (Recommended)

1. Install dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 44787,
    },
  },
};
```

3. Create `.env` file:
```
PRIVATE_KEY=your_private_key_here
```

4. Deploy:
```bash
npx hardhat run scripts/deploy.js --network alfajores
```

5. Add contract address to `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### Option 2: Using Remix IDE

1. Go to https://remix.ethereum.org
2. Create new file `BarcelMarketplace.sol`
3. Paste the contract code from `contracts/BarcelMarketplace.sol`
4. Compile with Solidity 0.8.20
5. Deploy to Celo Alfajores testnet
6. Copy contract address to `.env.local`

## Getting Testnet CELO

Get free testnet CELO from:
- https://faucet.celo.org/alfajores
- Or use the Celo Discord faucet

## How It Works

1. **Buyer Flow**:
   - Buyer approves an offer price
   - Buyer clicks "Buy Now"
   - Transaction is created on blockchain
   - Funds are sent to the contract
   - Transaction hash is stored

2. **Seller Flow**:
   - Seller sees "Payment Pending" status
   - Seller clicks "Complete Purchase"
   - Transaction transfers funds from contract to seller
   - Seller receives payment

## Contract Functions

- `createPurchase(seller, productId)`: Creates a purchase and locks funds
- `completePurchase(purchaseId)`: Transfers funds to seller
- `getPurchase(purchaseId)`: Returns purchase details
- `getSellerEarnings(seller)`: Returns total earnings

## Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

## Testing

1. Deploy contract to Alfajores testnet
2. Get testnet CELO from faucet
3. Connect wallet to Celo Alfajores network
4. Test purchase flow:
   - Seller approves offer
   - Buyer makes purchase (sends CELO to contract)
   - Seller completes purchase (receives CELO)

## Troubleshooting

- **"Contract not deployed"**: Make sure `NEXT_PUBLIC_CONTRACT_ADDRESS` is set in `.env.local`
- **"Insufficient funds"**: Get testnet CELO from faucet
- **"Transaction failed"**: Check you're on Celo Alfajores network
- **"Gas estimation failed"**: Ensure contract is deployed and address is correct

