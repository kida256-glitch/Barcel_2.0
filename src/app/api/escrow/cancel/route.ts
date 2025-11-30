import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { escrowId, buyerAddress } = body;

    // In production, this would interact with the smart contract
    // The actual contract interaction should happen on the client side

    return NextResponse.json({
      success: true,
      escrowId,
      message: 'Escrow cancelled. Please confirm the transaction in your wallet.',
    });
  } catch (error: any) {
    console.error('Escrow cancel error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel escrow' },
      { status: 500 }
    );
  }
}

