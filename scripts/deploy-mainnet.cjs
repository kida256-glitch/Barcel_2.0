const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  // Check for private key
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in .env file');
    process.exit(1);
  }

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider('https://forno.celo.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('\n🚀 Deploying contracts to Celo Mainnet...');
  console.log('📍 Deployer Address:', wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  const balanceCelo = Number(balance) / 1e18;
  console.log('💰 Balance:', balanceCelo.toFixed(4), 'CELO\n');
  
  if (balanceCelo < 0.1) {
    console.error('❌ Insufficient balance. Need at least 0.1 CELO for deployment.');
    process.exit(1);
  }

  // Load compiled contracts
  const marketplaceArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../artifacts/contracts/BarcelMarketplace.sol/BarcelMarketplace.json'), 'utf8')
  );
  const escrowArtifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../artifacts/contracts/BarcelEscrow.sol/BarcelEscrow.json'), 'utf8')
  );

  // Deploy Marketplace
  console.log('📦 [1/2] Deploying BarcelMarketplace...');
  const MarketplaceFactory = new ethers.ContractFactory(
    marketplaceArtifact.abi,
    marketplaceArtifact.bytecode,
    wallet
  );
  const marketplace = await MarketplaceFactory.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log('✅ BarcelMarketplace deployed:', marketplaceAddress);

  // Deploy Escrow
  console.log('\n📦 [2/2] Deploying BarcelEscrow...');
  const EscrowFactory = new ethers.ContractFactory(
    escrowArtifact.abi,
    escrowArtifact.bytecode,
    wallet
  );
  const escrow = await EscrowFactory.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log('✅ BarcelEscrow deployed:', escrowAddress);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('🎉 DEPLOYMENT SUCCESSFUL!');
  console.log('='.repeat(70));
  console.log('\n📝 Add these to your .env.local file:');
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${marketplaceAddress}`);
  console.log(`NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);
  console.log('\n🌐 View on Celo Explorer:');
  console.log(`Marketplace: https://celoscan.io/address/${marketplaceAddress}`);
  console.log(`Escrow:      https://celoscan.io/address/${escrowAddress}`);
  console.log('\n' + '='.repeat(70) + '\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
