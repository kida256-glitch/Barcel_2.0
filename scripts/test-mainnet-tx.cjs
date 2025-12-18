const { ethers } = require('ethers');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const RPC = process.env.CELO_MAINNET_RPC || 'https://forno.celo.org';
const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;

const ESCROW_ABI = [
  'function createEscrow(address seller, string productId) payable returns (bytes32)',
  'function refundBuyer(bytes32 escrowId) external',
  'event EscrowCreated(bytes32 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount, string productId, uint256 timestamp)'
];

async function main() {
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not set in .env.local');
    process.exit(1);
  }
  if (!ESCROW_ADDRESS) {
    console.error('❌ NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS not set in .env.local');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, wallet);

  console.log('🔗 Network RPC:', RPC);
  console.log('👤 Buyer (wallet):', wallet.address);
  console.log('🏦 Escrow contract:', ESCROW_ADDRESS);

  const balanceWei = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatEther ? ethers.formatEther(balanceWei) : balanceWei) ;
  console.log('💰 Balance (CELO):', balance);
  if (balance < 0.01) {
    console.error('❌ Insufficient balance (< 0.01 CELO). Aborting.');
    process.exit(1);
  }

  // Use a fixed seller address (must be different from buyer). Use a known non-zero address.
  const seller = '0x000000000000000000000000000000000000dEaD';
  const productId = 'barcel-tx-check';
  const valueWei = ethers.parseEther ? ethers.parseEther('0.001') : ethers.utils.parseEther('0.001');

  console.log('\n🧪 Creating escrow with small value (0.001 CELO)...');
  const createTx = await escrow.createEscrow(seller, productId, { value: valueWei });
  console.log('⛽ createEscrow tx hash:', createTx.hash);
  const createRcpt = await createTx.wait();
  console.log('✅ createEscrow mined in block', createRcpt.blockNumber);
  console.log('🔎 Explorer:', `https://celoscan.io/tx/${createTx.hash}`);

  // Parse escrowId from event logs
  const iface = new ethers.Interface(ESCROW_ABI);
  let escrowId = null;
  for (const log of createRcpt.logs) {
    try {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data });
      if (parsed && parsed.name === 'EscrowCreated') {
        escrowId = parsed.args.escrowId || parsed.args[0];
        break;
      }
    } catch (e) {
      // skip non-matching logs
    }
  }
  if (!escrowId) {
    console.error('❌ Failed to parse escrowId from logs');
    process.exit(1);
  }
  console.log('🆔 escrowId:', escrowId);

  console.log('\n↩️ Refunding escrow to buyer...');
  const refundTx = await escrow.refundBuyer(escrowId);
  console.log('⛽ refundBuyer tx hash:', refundTx.hash);
  const refundRcpt = await refundTx.wait();
  console.log('✅ refundBuyer mined in block', refundRcpt.blockNumber);
  console.log('🔎 Explorer:', `https://celoscan.io/tx/${refundTx.hash}`);

  console.log('\n🎉 Mainnet write transactions succeeded (createEscrow + refundBuyer).');
}

main().catch((err) => {
  console.error('❌ Test transaction failed:', err.message || err);
  process.exit(1);
});
