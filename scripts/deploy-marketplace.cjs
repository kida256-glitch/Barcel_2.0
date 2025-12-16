const hre = require("hardhat");

async function main() {
  console.log("Deploying BarcelMarketplace contract...");

  const BarcelMarketplace = await hre.ethers.getContractFactory("BarcelMarketplace");
  const marketplace = await BarcelMarketplace.deploy();

  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("BarcelMarketplace deployed to:", address);
  console.log("\nAdd this to your .env.local file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
