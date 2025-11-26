# Smart Contract Deployment Guide

## Prerequisites

1. Install Hardhat and dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

2. Create a `.env` file in the root directory:
```
PRIVATE_KEY=your_private_key_here
CELO_TESTNET_RPC=https://alfajores-forno.celo-testnet.org
```

## Deployment Steps

1. Initialize Hardhat (if not already done):
```bash
npx hardhat init
```

2. Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    alfajores: {
      url: process.env.CELO_TESTNET_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 44787,
    },
  },
};
```

3. Deploy the contract:
```bash
npx hardhat run scripts/deploy.js --network alfajores
```

4. Copy the deployed contract address and add it to your `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

## Alternative: Manual Deployment

You can also deploy using Remix IDE:
1. Go to https://remix.ethereum.org
2. Create a new file `BarcelMarketplace.sol` and paste the contract code
3. Compile with Solidity 0.8.20
4. Deploy to Celo Alfajores testnet
5. Copy the contract address to your `.env.local`

## Getting Testnet CELO

Get testnet CELO from the Celo Faucet:
https://faucet.celo.org/alfajores

