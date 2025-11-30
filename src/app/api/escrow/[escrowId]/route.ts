import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ escrowId: string }> }
) {
  try {
    const { escrowId } = await params;

    // In production, this would query the smart contract or database
    // For now, return mock data
    return NextResponse.json({
      escrowId,
      buyer: '0x0000000000000000000000000000000000000000',
      seller: '0x0000000000000000000000000000000000000000',
      amount: '0',
      status: 'pending',
      createdAt: new Date().toISOString(),
      productId: '',
    });
  } catch (error: any) {
    console.error('Escrow status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get escrow status' },
      { status: 500 }
    );
  }
}

