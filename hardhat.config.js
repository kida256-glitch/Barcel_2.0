import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      type: 'http',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 44787,
    },
    celo: {
      url: "https://forno.celo.org",
      type: 'http',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42220,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

