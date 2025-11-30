import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/ai/genkit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, sellerId, currentPrice, targetPrice, style, buyerAddress } = body;

    if (!process.env.GOOGLE_GENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Simulate seller minimum price (in production, fetch from database)
    const sellerMinimumPrice = currentPrice * 0.7; // 30% discount max

    // Generate buyer AI message based on style
    const buyerPrompt = `You are a buyer negotiating for a product. 
Current price: $${currentPrice}
Target price: $${targetPrice}
Style: ${style}

Generate a ${style} negotiation message to convince the seller to lower the price. Keep it under 100 words.`;

    const buyerMessage = await generateText(buyerPrompt) || `I'd like to negotiate the price. Can we work something out around $${targetPrice}?`;

    // Generate seller AI counter-offer
    const sellerPrompt = `You are a seller responding to a buyer's negotiation.
Current price: $${currentPrice}
Buyer's target: $${targetPrice}
Buyer's message: ${buyerMessage}
Your minimum acceptable price: $${sellerMinimumPrice}

Generate a professional counter-offer. You can go down to $${sellerMinimumPrice} but try to stay higher. Keep it under 100 words.`;

    const sellerMessage = await generateText(sellerPrompt) || `I can offer you $${sellerMinimumPrice}, which is my best price.`;

    // Calculate fair final price (meet in the middle, but respect minimum)
    const midPoint = (currentPrice + targetPrice) / 2;
    const finalPrice = Math.max(midPoint, sellerMinimumPrice);

    // Create negotiation steps
    const steps = [
      {
        step: 1,
        from: 'buyer' as const,
        message: buyerMessage,
        price: targetPrice,
        timestamp: new Date().toISOString(),
      },
      {
        step: 2,
        from: 'seller' as const,
        message: sellerMessage,
        price: finalPrice,
        timestamp: new Date().toISOString(),
      },
    ];

    const negotiationId = `neg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      steps,
      finalPrice,
      finalOffer: {
        price: finalPrice,
        message: `Seller's final offer: $${finalPrice.toFixed(2)}`,
        accepted: finalPrice <= targetPrice * 1.1, // Accept if within 10% of target
      },
      negotiationId,
    });
  } catch (error: any) {
    console.error('Negotiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process negotiation' },
      { status: 500 }
    );
  }
}

