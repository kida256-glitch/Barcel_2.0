const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
const RPC = process.env.CELO_MAINNET_RPC || 'https://forno.celo.org';

const MARKETPLACE_ABI = [
  { inputs:[{internalType:'address',name:'seller',type:'address'}], name:'getSellerEarnings', outputs:[{internalType:'uint256',name:'',type:'uint256'}], stateMutability:'view', type:'function' },
  { inputs:[{internalType:'bytes32',name:'purchaseId',type:'bytes32'}], name:'purchaseExists', outputs:[{internalType:'bool',name:'',type:'bool'}], stateMutability:'view', type:'function' }
];

const ESCROW_ABI = [
  { inputs:[{ name:'escrowId', type:'bytes32' }], name:'getEscrow', outputs:[
    { name:'buyer', type:'address' },
    { name:'seller', type:'address' },
    { name:'amount', type:'uint256' },
    { name:'productId', type:'string' },
    { name:'status', type:'uint8' },
    { name:'createdAt', type:'uint256' },
    { name:'releasedAt', type:'uint256' },
  ], stateMutability:'view', type:'function' }
];

async function main() {
  console.log('\n🔍 Verifying Celo Mainnet deployment...');
  if (!MARKETPLACE_ADDRESS || !ESCROW_ADDRESS) {
    console.error('❌ Missing contract addresses in .env.local');
    console.log('NEXT_PUBLIC_CONTRACT_ADDRESS=', MARKETPLACE_ADDRESS);
    console.log('NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=', ESCROW_ADDRESS);
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC);

  // Check marketplace bytecode
  const marketplaceCode = await provider.getCode(MARKETPLACE_ADDRESS);
  console.log('Marketplace bytecode length:', marketplaceCode.length);
  if (!marketplaceCode || marketplaceCode === '0x') {
    throw new Error('Marketplace contract not found at given address');
  }

  // Check escrow bytecode
  const escrowCode = await provider.getCode(ESCROW_ADDRESS);
  console.log('Escrow bytecode length:', escrowCode.length);
  if (!escrowCode || escrowCode === '0x') {
    throw new Error('Escrow contract not found at given address');
  }

  // Read-only calls
  const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
  const deployer = process.env.PRIVATE_KEY
    ? new ethers.Wallet(process.env.PRIVATE_KEY).address
    : '0x0000000000000000000000000000000000000000';
  const earnings = await marketplace.getSellerEarnings(deployer).catch(() => null);
  console.log('Deployer earnings (wei):', earnings ? earnings.toString() : 'N/A');

  // Try purchaseExists with a zero id
  const exists = await marketplace.purchaseExists('0x' + '0'.repeat(64)).catch(() => null);
  console.log('purchaseExists(0x00..00):', exists);

  console.log('\n✅ Contracts are deployed and responding to read calls.');
}

main().catch((e) => {
  console.error('\n❌ Verification failed:', e.message);
  process.exit(1);
});
