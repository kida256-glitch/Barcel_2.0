import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { JsonRpcProvider, Wallet, ContractFactory } from 'ethers';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deployContract(artifactPath, rpcUrl, privateKey) {
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = artifact.abi;
  const bytecode = artifact.bytecode;

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  console.log(`Deploying ${artifact.contractName} using account ${wallet.address}`);
  const factory = new ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.deployed();
  console.log(`${artifact.contractName} deployed at ${contract.address}`);
  return contract.address;
}

(async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('PRIVATE_KEY not set in .env.local');
    process.exit(1);
  }

  const rpcUrl = process.env.CELO_RPC || 'https://alfajores-forno.celo-testnet.org';

  const artifactsDir = path.resolve(process.cwd(), 'artifacts/contracts');

  // Marketplace
  const marketplaceArtifact = path.join(artifactsDir, 'BarcelMarketplace.sol', 'BarcelMarketplace.json');
  if (!fs.existsSync(marketplaceArtifact)) {
    console.error('Marketplace artifact not found:', marketplaceArtifact);
  } else {
    const addr = await deployContract(marketplaceArtifact, rpcUrl, privateKey);
    console.log('Marketplace address:', addr);
    // update .env.local
    let env = fs.readFileSync('.env.local', 'utf8');
    env = env.replace(/#?NEXT_PUBLIC_CONTRACT_ADDRESS=.*\n?/, `NEXT_PUBLIC_CONTRACT_ADDRESS=${addr}\n`);
    fs.writeFileSync('.env.local', env);
  }

  // Escrow
  const escrowArtifact = path.join(artifactsDir, 'BarcelEscrow.sol', 'BarcelEscrow.json');
  if (!fs.existsSync(escrowArtifact)) {
    console.error('Escrow artifact not found:', escrowArtifact);
  } else {
    const addr = await deployContract(escrowArtifact, rpcUrl, privateKey);
    console.log('Escrow address:', addr);
    // update .env.local
    let env = fs.readFileSync('.env.local', 'utf8');
    env = env.replace(/#?NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=.*\n?/, `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${addr}\n`);
    fs.writeFileSync('.env.local', env);
  }

  console.log('Deployment complete. Updated .env.local with addresses.');
})();
