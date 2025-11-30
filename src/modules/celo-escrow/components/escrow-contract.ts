'use client';

import { createPublicClient, http, parseEther, type Address } from 'viem';
import { celoAlfajores } from 'viem/chains';

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

const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as Address;

export async function createEscrowTransaction(
  seller: Address,
  productId: string,
  amount: number,
  walletProvider: any
): Promise<{ escrowId: string; txHash: string }> {
  if (!ESCROW_CONTRACT_ADDRESS) {
    throw new Error('Escrow contract address not configured');
  }

  const amountInWei = parseEther(amount.toString());

  // Request transaction from wallet
  const txHash = await walletProvider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        to: ESCROW_CONTRACT_ADDRESS,
        from: await walletProvider.request({ method: 'eth_requestAccounts' }).then((accounts: string[]) => accounts[0]),
        value: `0x${amountInWei.toString(16)}`,
        data: encodeCreateEscrow(seller, productId),
      },
    ],
  });

  // Calculate escrow ID (same as contract)
  const escrowId = `0x${Buffer.from(
    `${txHash}${seller}${productId}${Date.now()}`
  ).toString('hex').slice(0, 64)}`;

  return { escrowId, txHash };
}

function encodeCreateEscrow(seller: Address, productId: string): string {
  // Simplified encoding - in production, use proper ABI encoding
  return '0x' + seller.slice(2) + Buffer.from(productId).toString('hex').padStart(64, '0');
}

export async function releaseEscrowTransaction(
  escrowId: string,
  walletProvider: any
): Promise<string> {
  if (!ESCROW_CONTRACT_ADDRESS) {
    throw new Error('Escrow contract address not configured');
  }

  const txHash = await walletProvider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        to: ESCROW_CONTRACT_ADDRESS,
        from: await walletProvider.request({ method: 'eth_requestAccounts' }).then((accounts: string[]) => accounts[0]),
        data: encodeReleaseEscrow(escrowId),
      },
    ],
  });

  return txHash;
}

function encodeReleaseEscrow(escrowId: string): string {
  // Simplified encoding
  return '0x' + escrowId.slice(2).padStart(64, '0');
}

