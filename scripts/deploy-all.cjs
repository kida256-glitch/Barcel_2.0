const hre = require("hardhat");

async function main() {
  const networkName = hre.network.name;
  const isMainnet = networkName === "celo";
  const explorerBase = isMainnet 
    ? "https://celoscan.io" 
    : "https://alfajores.celoscan.io";

  console.log(`\n🚀 Deploying all contracts to ${isMainnet ? 'Celo Mainnet' : 'Celo Alfajores'}...\n`);

  // Deploy Marketplace
  console.log("📦 [1/2] Deploying BarcelMarketplace...");
  const BarcelMarketplace = await hre.ethers.getContractFactory("BarcelMarketplace");
  const marketplace = await BarcelMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ BarcelMarketplace deployed:", marketplaceAddress);

  // Deploy Escrow
  console.log("\n📦 [2/2] Deploying BarcelEscrow...");
  const BarcelEscrow = await hre.ethers.getContractFactory("BarcelEscrow");
  const escrow = await BarcelEscrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ BarcelEscrow deployed:", escrowAddress);

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(70));
  console.log("\n📝 Add these to your .env.local file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${marketplaceAddress}`);
  console.log(`NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);
  
  console.log("\n🌐 View on Celo Explorer:");
  console.log(`Marketplace: ${explorerBase}/address/${marketplaceAddress}`);
  console.log(`Escrow:      ${explorerBase}/address/${escrowAddress}`);
  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
