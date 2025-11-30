'use client';

import { createPublicClient, createWalletClient, custom, http, parseEther, formatEther, type Address } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { CELO_TESTNET_CHAIN_ID } from './wallet';

// Contract ABI (Application Binary Interface)
export const BARCEL_MARKETPLACE_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'seller', type: 'address' },
      { internalType: 'string', name: 'productId', type: 'string' },
    ],
    name: 'createPurchase',
    outputs: [{ internalType: 'bytes32', name: 'purchaseId', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'purchaseId', type: 'bytes32' }],
    name: 'completePurchase',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'purchaseId', type: 'bytes32' }],
    name: 'getPurchase',
    outputs: [
      { internalType: 'address', name: 'buyer', type: 'address' },
      { internalType: 'address', name: 'seller', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'string', name: 'productId', type: 'string' },
      { internalType: 'bool', name: 'completed', type: 'bool' },
      { internalType: 'bool', name: 'refunded', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'seller', type: 'address' }],
    name: 'getSellerEarnings',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'purchaseId', type: 'bytes32' }],
    name: 'purchaseExists',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'purchaseId', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'buyer', type: 'address' },
      { indexed: true, internalType: 'address', name: 'seller', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'string', name: 'productId', type: 'string' },
    ],
    name: 'PurchaseCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'purchaseId', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'buyer', type: 'address' },
      { indexed: true, internalType: 'address', name: 'seller', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'PurchaseCompleted',
    type: 'event',
  },
] as const;

// Contract address on Celo Alfajores testnet
// Set this in your .env.local file after deploying the contract
// Example: NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const CONTRACT_ADDRESS = (contractAddress && contractAddress.startsWith('0x') 
  ? contractAddress 
  : '0x0000000000000000000000000000000000000000') as `0x${string}`;

/**
 * Get the wallet client for making transactions
 */
export function getWalletClient() {
  if (typeof window === 'undefined') return null;

  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;

  return createWalletClient({
    chain: celoAlfajores,
    transport: custom(ethereum),
  });
}

/**
 * Get the public client for reading contract state
 */
export function getPublicClient() {
  return createPublicClient({
    chain: celoAlfajores,
    transport: http('https://alfajores-forno.celo-testnet.org'),
  });
}

/**
 * Create a purchase transaction on the blockchain
 * @param sellerAddress The seller's wallet address
 * @param productId The product identifier
 * @param amountInCELO The amount to pay in CELO (not wei)
 * @returns The purchase ID and transaction hash
 */
export async function createPurchaseTransaction(
  sellerAddress: Address,
  productId: string,
  amountInCELO: number
): Promise<{ purchaseId: string; txHash: string }> {
  const walletClient = getWalletClient();
  if (!walletClient) {
    throw new Error('Wallet not connected');
  }

  const [account] = await walletClient.getAddresses();
  if (!account) {
    throw new Error('No account found');
  }

  const publicClient = getPublicClient();

  // Convert CELO amount to wei
  const amountInWei = parseEther(amountInCELO.toString());

  // Check if contract address is set
  if (!contractAddress || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    throw new Error('Smart contract not deployed. Please deploy the contract and set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local file.');
  }

  try {
    // Estimate gas
    const gas = await publicClient.estimateContractGas({
      address: CONTRACT_ADDRESS as Address,
      abi: BARCEL_MARKETPLACE_ABI,
      functionName: 'createPurchase',
      args: [sellerAddress, productId],
      account,
      value: amountInWei,
    });

    // Simulate the transaction first to get the return value (purchaseId)
    const { result: purchaseId } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS as Address,
      abi: BARCEL_MARKETPLACE_ABI,
      functionName: 'createPurchase',
      args: [sellerAddress, productId],
      account,
      value: amountInWei,
    });

    // Send transaction
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS as Address,
      abi: BARCEL_MARKETPLACE_ABI,
      functionName: 'createPurchase',
      args: [sellerAddress, productId],
      account,
      value: amountInWei,
      gas,
    });

    // Wait for transaction receipt
    await publicClient.waitForTransactionReceipt({ hash });

    // Use the simulated purchaseId (or fallback to hash)
    const finalPurchaseId = purchaseId || hash;

    return { purchaseId: finalPurchaseId, txHash: hash };
  } catch (error: any) {
    console.error('Transaction error:', error);
    throw new Error(error.message || 'Failed to create purchase transaction');
  }
}

/**
 * Complete a purchase (seller confirms receipt of payment)
 * @param purchaseId The purchase ID from the blockchain
 */
export async function completePurchaseTransaction(purchaseId: string): Promise<string> {
  const walletClient = getWalletClient();
  if (!walletClient) {
    throw new Error('Wallet not connected');
  }

  const [account] = await walletClient.getAddresses();
  if (!account) {
    throw new Error('No account found');
  }

  const publicClient = getPublicClient();

  if (!contractAddress || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    throw new Error('Smart contract not deployed. Please deploy the contract and set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local file.');
  }

  try {
    // Ensure purchaseId is in the correct format (0x...)
    const formattedPurchaseId = purchaseId.startsWith('0x') 
      ? purchaseId as `0x${string}`
      : `0x${purchaseId}` as `0x${string}`;

    // Estimate gas
    const gas = await publicClient.estimateContractGas({
      address: CONTRACT_ADDRESS as Address,
      abi: BARCEL_MARKETPLACE_ABI,
      functionName: 'completePurchase',
      args: [formattedPurchaseId],
      account,
    });

    // Send transaction
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS as Address,
      abi: BARCEL_MARKETPLACE_ABI,
      functionName: 'completePurchase',
      args: [formattedPurchaseId],
      account,
      gas,
    });

    // Wait for transaction receipt
    await publicClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error: any) {
    console.error('Transaction error:', error);
    throw new Error(error.message || 'Failed to complete purchase transaction');
  }
}

/**
 * Get purchase details from the blockchain
 */
export async function getPurchaseDetails(purchaseId: string) {
  const publicClient = getPublicClient();

  if (!contractAddress || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    throw new Error('Smart contract not deployed');
  }

  try {
    const purchase = await publicClient.readContract({
      address: CONTRACT_ADDRESS as Address,
      abi: BARCEL_MARKETPLACE_ABI,
      functionName: 'getPurchase',
      args: [purchaseId as `0x${string}`],
    });

    return {
      buyer: purchase[0],
      seller: purchase[1],
      amount: formatEther(purchase[2]),
      productId: purchase[3],
      completed: purchase[4],
      refunded: purchase[5],
    };
  } catch (error: any) {
    console.error('Error reading purchase:', error);
    throw new Error(error.message || 'Failed to read purchase details');
  }
}

/**
 * Get seller's total earnings
 */
export async function getSellerEarnings(sellerAddress: Address): Promise<string> {
  const publicClient = getPublicClient();

  if (!contractAddress || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return '0';
  }

  try {
    const earnings = await publicClient.readContract({
      address: CONTRACT_ADDRESS as Address,
      abi: BARCEL_MARKETPLACE_ABI,
      functionName: 'getSellerEarnings',
      args: [sellerAddress],
    });

    return formatEther(earnings);
  } catch (error: any) {
    console.error('Error reading seller earnings:', error);
    return '0';
  }
}

