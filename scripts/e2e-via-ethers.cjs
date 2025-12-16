const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

async function readArtifact(contractName) {
  const p = path.join(__dirname, '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const rpc = 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(rpc);

  console.log('Connecting to local Hardhat node at', rpc);
  const deployer = provider.getSigner(0);
  const buyer = provider.getSigner(1);
  const seller = provider.getSigner(2);

  const deployerAddr = await deployer.getAddress();
  const buyerAddr = await buyer.getAddress();
  const sellerAddr = await seller.getAddress();
  console.log('Accounts:');
  console.log(' Deployer:', deployerAddr);
  console.log(' Buyer:   ', buyerAddr);
  console.log(' Seller:  ', sellerAddr);

  const marketplaceArt = await readArtifact('BarcelMarketplace');
  const escrowArt = await readArtifact('BarcelEscrow');

  const MarketplaceFactory = new ethers.ContractFactory(marketplaceArt.abi, marketplaceArt.bytecode, deployer);
  const marketplace = await MarketplaceFactory.deploy();
  if (marketplace.waitForDeployment) await marketplace.waitForDeployment();
  const marketAddress = marketplace.target || marketplace.address || (await marketplace.getAddress?.());
  console.log('Marketplace deployed at', marketAddress);

  const EscrowFactory = new ethers.ContractFactory(escrowArt.abi, escrowArt.bytecode, deployer);
  const escrow = await EscrowFactory.deploy();
  if (escrow.waitForDeployment) await escrow.waitForDeployment();
  const escrowAddress = escrow.target || escrow.address || (await escrow.getAddress?.());
  console.log('Escrow deployed at', escrowAddress);

  // Show balances
  const buyerBalanceBefore = await provider.getBalance(buyerAddr);
  const sellerBalanceBefore = await provider.getBalance(sellerAddr);
  console.log('Balances before:');
  console.log(' Buyer:', ethers.formatEther ? ethers.formatEther(buyerBalanceBefore) : buyerBalanceBefore.toString());
  console.log(' Seller:', ethers.formatEther ? ethers.formatEther(sellerBalanceBefore) : sellerBalanceBefore.toString());

  // Create purchase (buyer)
  const productId = 'product-123';
  const purchaseAmount = ethers.parseEther ? ethers.parseEther('1.0') : ethers.utils.parseEther('1.0');
  const marketplaceBuyer = marketplace.connect(buyer);
  console.log('Creating purchase for 1 ETH-equivalent');
  const tx = await marketplaceBuyer.createPurchase(sellerAddr, productId, { value: purchaseAmount });
  await tx.wait();

  // Try to find the purchaseId via event (if emitted)
  let purchaseId = null;
  try {
    const receipt = await provider.getTransactionReceipt(tx.hash);
    const events = receipt.logs || [];
    // Keep simple: assume purchaseId is 1 for local run if contract uses incrementing id
    purchaseId = 1;
  } catch (e) {
    purchaseId = 1;
  }

  // Seller completes the purchase
  const marketplaceSeller = marketplace.connect(seller);
  const completeTx = await marketplaceSeller.completePurchase(purchaseId);
  await completeTx.wait();

  const buyerBalanceAfter = await provider.getBalance(buyerAddr);
  const sellerBalanceAfter = await provider.getBalance(sellerAddr);
  console.log('Balances after:');
  console.log(' Buyer:', ethers.formatEther ? ethers.formatEther(buyerBalanceAfter) : buyerBalanceAfter.toString());
  console.log(' Seller:', ethers.formatEther ? ethers.formatEther(sellerBalanceAfter) : sellerBalanceAfter.toString());

  console.log('E2E via ethers completed');
}

main().catch((err) => {
  console.error('E2E via ethers failed:', err);
  process.exit(1);
});
