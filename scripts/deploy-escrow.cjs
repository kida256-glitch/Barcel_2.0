const hre = require("hardhat");

async function main() {
  console.log("Deploying BarcelEscrow contract to Celo Alfajores...");

  const BarcelEscrow = await hre.ethers.getContractFactory("BarcelEscrow");
  const escrow = await BarcelEscrow.deploy();

  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log("\n✅ BarcelEscrow deployed successfully!");
  console.log("Contract Address:", address);
  console.log("\n📝 Add this to your .env.local file:");
  console.log(`NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${address}`);
  console.log("\n🌐 View on Celo Explorer:");
  console.log(`https://alfajores.celoscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

