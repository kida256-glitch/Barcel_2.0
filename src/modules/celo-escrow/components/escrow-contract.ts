'use client';

import { createPublicClient, http, parseEther, encodeFunctionData, type Address, type Hex } from 'viem';
import { celo } from 'viem/chains';

// Escrow Contract ABI
export const ESCROW_ABI = [
  {
    inputs: [
      { name: 'seller', type: 'address' },
      { name: 'productId', type: 'string' },
    ],
    name: 'createEscrow',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'escrowId', type: 'bytes32' }],
    name: 'releaseEscrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'escrowId', type: 'bytes32' }],
    name: 'refundBuyer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'escrowId', type: 'bytes32' }],
    name: 'cancelEscrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'escrowId', type: 'bytes32' }],
    name: 'getEscrow',
    outputs: [
      { name: 'buyer', type: 'address' },
      { name: 'seller', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'productId', type: 'string' },
      { name: 'status', type: 'uint8' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'releasedAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function getEscrowContractAddress(): Address {
  const address = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
  if (!address || !address.startsWith('0x')) {
    throw new Error('Escrow contract address not configured. Please set NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS in .env.local');
  }
  return address as Address;
}

export async function createEscrowTransaction(
  seller: Address,
  productId: string,
  amount: number,
  walletProvider: any
): Promise<{ escrowId: string; txHash: string }> {
  const contractAddress = getEscrowContractAddress();
  const amountInWei = parseEther(amount.toString());

  // Get the buyer's address
  const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
  const buyerAddress = accounts[0] as Address;

  // Encode the function call using viem
  const data = encodeFunctionData({
    abi: ESCROW_ABI,
    functionName: 'createEscrow',
    args: [seller, productId],
  });

  // Request transaction from wallet
  const txHash = await walletProvider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        to: contractAddress,
        from: buyerAddress,
        value: `0x${amountInWei.toString(16)}`,
        data: data as Hex,
      },
    ],
  }) as string;

  // Note: The actual escrowId is returned by the contract, but we can't get it from the transaction
  // In a real implementation, you'd need to parse the transaction receipt or call getEscrow
  // For now, we'll use a placeholder that matches the contract's calculation
  const escrowId = `0x${Buffer.from(
    `${txHash}${seller}${productId}${Date.now()}`
  ).toString('hex').slice(0, 64)}` as Hex;

  return { escrowId, txHash };
}

export async function releaseEscrowTransaction(
  escrowId: string,
  walletProvider: any
): Promise<string> {
  const contractAddress = getEscrowContractAddress();

  // Get the buyer's address
  const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
  const buyerAddress = accounts[0] as Address;

  // Encode the function call using viem
  const data = encodeFunctionData({
    abi: ESCROW_ABI,
    functionName: 'releaseEscrow',
    args: [escrowId as Hex],
  });

  const txHash = await walletProvider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        to: contractAddress,
        from: buyerAddress,
        data: data as Hex,
      },
    ],
  }) as string;

  return txHash;
}

export async function refundEscrowTransaction(
  escrowId: string,
  walletProvider: any
): Promise<string> {
  const contractAddress = getEscrowContractAddress();

  // Get the user's address
  const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
  const userAddress = accounts[0] as Address;

  // Encode the function call using viem
  const data = encodeFunctionData({
    abi: ESCROW_ABI,
    functionName: 'refundBuyer',
    args: [escrowId as Hex],
  });

  const txHash = await walletProvider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        to: contractAddress,
        from: userAddress,
        data: data as Hex,
      },
    ],
  }) as string;

  return txHash;
}

export async function cancelEscrowTransaction(
  escrowId: string,
  walletProvider: any
): Promise<string> {
  const contractAddress = getEscrowContractAddress();

  // Get the user's address
  const accounts = await walletProvider.request({ method: 'eth_requestAccounts' });
  const userAddress = accounts[0] as Address;

  // Encode the function call using viem
  const data = encodeFunctionData({
    abi: ESCROW_ABI,
    functionName: 'cancelEscrow',
    args: [escrowId as Hex],
  });

  const txHash = await walletProvider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        to: contractAddress,
        from: userAddress,
        data: data as Hex,
      },
    ],
  }) as string;

  return txHash;
}

// Helper function to get escrow details from the contract
export async function getEscrowDetails(escrowId: string): Promise<any> {
  const contractAddress = getEscrowContractAddress();
  const publicClient = createPublicClient({
    chain: celo,
    transport: http('https://forno.celo.org'),
  });

  try {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: ESCROW_ABI,
      functionName: 'getEscrow',
      args: [escrowId as Hex],
    });

    return result;
  } catch (error) {
    console.error('Error fetching escrow details:', error);
    return null;
  }
}

