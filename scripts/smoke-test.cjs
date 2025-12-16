const hre = require('hardhat');
const { ethers } = hre;
const fs = require('fs');

async function main() {
  const network = hre.network.name;
  console.log(`Running smoke test on network: ${network}`);

  const [signer] = await ethers.getSigners();
  console.log('Using signer:', signer.address);

  const balance = await signer.getBalance();
  console.log('Signer balance (wei):', balance.toString());

  // Read contract addresses from env or .env.local suggestions
  const marketplaceAddr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const escrowAddr = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;

  if (!marketplaceAddr && !escrowAddr) {
    console.log('No contract addresses provided in env (NEXT_PUBLIC_CONTRACT_ADDRESS or NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS). Smoke test will only check provider and signer.');
    return;
  }

  if (marketplaceAddr) {
    const ABI = [
      'function getSellerEarnings(address) view returns (uint256)',
      'function purchaseExists(bytes32) view returns (bool)'
    ];
    const marketplace = new ethers.Contract(marketplaceAddr, ABI, ethers.provider);
    try {
      const earnings = await marketplace.getSellerEarnings(signer.address);
      console.log(`Seller earnings for signer: ${earnings.toString()}`);
    } catch (e) {
      console.error('Failed to call getSellerEarnings:', e.message || e);
    }
  }

  if (escrowAddr) {
    const ABI = [
      'function getBuyerEscrows(address) view returns (bytes32[])',
      'function getSellerEscrows(address) view returns (bytes32[])'
    ];
    const escrow = new ethers.Contract(escrowAddr, ABI, ethers.provider);
    try {
      const buyerEscrows = await escrow.getBuyerEscrows(signer.address);
      console.log('Buyer escrows count:', buyerEscrows.length);
    } catch (e) {
      console.error('Failed to call getBuyerEscrows:', e.message || e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
