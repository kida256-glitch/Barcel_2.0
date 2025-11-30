import { NextRequest, NextResponse } from 'next/server';

// In production, this would fetch from database
// For now, we'll calculate based on mock data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Mock trust score calculation
    // In production, fetch from database:
    // - successfulEscrows: count from escrow contract events
    // - disputes: count from dispute records
    // - completedNegotiations: count from negotiation logs
    // - deliveryConfirmations: count from delivery confirmations

    const mockData = {
      successfulEscrows: 0,
      disputes: 0,
      completedNegotiations: 0,
      deliveryConfirmations: 0,
    };

    // Calculate score (0-100)
    let score = 0;
    score += mockData.successfulEscrows * 10; // 10 points per escrow
    score += mockData.completedNegotiations * 5; // 5 points per negotiation
    score += mockData.deliveryConfirmations * 3; // 3 points per confirmation
    score -= mockData.disputes * 15; // -15 points per dispute

    score = Math.max(0, Math.min(100, score));

    // Determine level
    let level: 'new' | 'bronze' | 'silver' | 'gold' | 'platinum' = 'new';
    if (score >= 80) level = 'platinum';
    else if (score >= 60) level = 'gold';
    else if (score >= 40) level = 'silver';
    else if (score >= 20) level = 'bronze';

    return NextResponse.json({
      score,
      level,
      ...mockData,
    });
  } catch (error: any) {
    console.error('Trust score error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get trust score' },
      { status: 500 }
    );
  }
}

