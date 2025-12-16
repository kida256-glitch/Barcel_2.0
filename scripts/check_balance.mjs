import { JsonRpcProvider } from 'ethers';

const rpc = process.env.CELO_RPC || 'https://forno.celo.org';
const addr = process.argv[2];
if (!addr) {
  console.error('Usage: node scripts/check_balance.mjs <address>');
  process.exit(1);
}

async function main() {
  const provider = new JsonRpcProvider(rpc);
  const balance = await provider.getBalance(addr);
  console.log('Address:', addr);
  console.log('Balance (wei):', balance.toString());
  try {
    const formatted = Number(balance) / 1e18;
    console.log('Balance (CELO):', formatted);
  } catch (e) {
    console.log('Balance (CELO):', String(balance));
  }
}

main().catch((err) => {
  console.error('Error checking balance:', err);
  process.exit(1);
});
