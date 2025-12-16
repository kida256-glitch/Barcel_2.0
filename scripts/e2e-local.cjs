let hre;

async function main() {
  console.log('Starting local end-to-end test on Hardhat network');

  const [deployer, buyer, seller] = await hre.ethers.getSigners();
  console.log('Accounts:');
  console.log(' Deployer:', deployer.address);
  console.log(' Buyer:   ', buyer.address);
  console.log(' Seller:  ', seller.address);

  // Deploy Marketplace
  const Marketplace = await hre.ethers.getContractFactory('BarcelMarketplace', deployer);
  const marketplace = await Marketplace.deploy();
  if (marketplace.waitForDeployment) await marketplace.waitForDeployment();
  const marketAddress = marketplace.address || (await marketplace.getAddress?.());
  console.log('Marketplace deployed at', marketAddress);

  // Deploy Escrow
  const Escrow = await hre.ethers.getContractFactory('BarcelEscrow', deployer);
  const escrow = await Escrow.deploy();
  if (escrow.waitForDeployment) await escrow.waitForDeployment();
  const escrowAddress = escrow.address || (await escrow.getAddress?.());
  console.log('Escrow deployed at', escrowAddress);

  // Show initial balances
  const buyerBalanceBefore = await hre.ethers.provider.getBalance(buyer.address);
  const sellerBalanceBefore = await hre.ethers.provider.getBalance(seller.address);
  console.log('Balances before:');
  console.log(' Buyer:', hre.ethers.formatEther ? hre.ethers.formatEther(buyerBalanceBefore) : buyerBalanceBefore.toString());
  console.log(' Seller:', hre.ethers.formatEther ? hre.ethers.formatEther(sellerBalanceBefore) : sellerBalanceBefore.toString());

  // Buyer creates a purchase on marketplace (payable)
  const productId = 'product-123';
  const purchaseAmount = hre.ethers.parseEther ? hre.ethers.parseEther('1.0') : hre.ethers.utils.parseEther('1.0');

  console.log('Creating purchase via buyer for 1 CELO (simulated)');
  const marketplaceConnected = marketplace.connect(buyer);
  const tx = await marketplaceConnected.createPurchase(seller.address, productId, { value: purchaseAmount });
  const receipt = await tx.wait();
  const event = receipt.events?.find((e) => e.event === 'PurchaseCreated');
  const purchaseId = event?.args?.purchaseId || null;
  console.log('PurchaseCreated event, id:', purchaseId?.toString() || '<none>');

  // Seller completes purchase
  console.log('Seller completing purchase to transfer funds to seller');
  const marketplaceSeller = marketplace.connect(seller);
  const completeTx = await marketplaceSeller.completePurchase(purchaseId);
  await completeTx.wait();

  const buyerBalanceAfter = await hre.ethers.provider.getBalance(buyer.address);
  const sellerBalanceAfter = await hre.ethers.provider.getBalance(seller.address);
  console.log('Balances after:');
  console.log(' Buyer:', hre.ethers.formatEther ? hre.ethers.formatEther(buyerBalanceAfter) : buyerBalanceAfter.toString());
  console.log(' Seller:', hre.ethers.formatEther ? hre.ethers.formatEther(sellerBalanceAfter) : sellerBalanceAfter.toString());

  // Sanity checks
  const purchaseExists = await marketplace.purchaseExists(purchaseId);
  console.log('Purchase exists:', purchaseExists);

  console.log('Local end-to-end test completed successfully');
}

// Load Hardhat (ESM) dynamically, then invoke main().
(async () => {
  try {
    const mod = await import('hardhat');
    hre = mod.default ?? mod;
    await main();
    process.exit(0);
  } catch (err) {
    console.error('E2E test failed:', err);
    process.exit(1);
  }
})();
