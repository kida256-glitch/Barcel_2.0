import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/ai/genkit';
import { getAllProducts } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, history } = body;

    const hasGoogle = !!process.env.GOOGLE_GENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY || process.env.AI_PROVIDER === 'anthropic' || process.env.USE_CLAUDE === 'true';
    if (!hasGoogle && !hasAnthropic) {
      return NextResponse.json(
        { error: 'AI service not configured. Set GOOGLE_GENAI_API_KEY or ANTHROPIC_API_KEY (or AI_PROVIDER=anthropic / USE_CLAUDE=true).' },
        { status: 500 }
      );
    }

    // Get products for search functionality
    const allProducts = getAllProducts();

    // Build context for AI
    const systemContext = `You are a helpful AI assistant for Barcel, a CELO-based marketplace.
Current screen: ${context?.currentScreen || 'unknown'}
User role: ${context?.userRole || 'unknown'}
User wallet: ${context?.walletAddress || 'not connected'}

You can help with:
- Finding products (search by name, category, price)
- Explaining how CELO escrow works
- Assisting with negotiations
- Navigating the app
- Answering FAQs about the marketplace

When user asks about products, search through available products and return relevant ones.
When user wants to navigate, return navigation commands in JSON format.
Be helpful, concise, and friendly.`;

    const prompt = `${systemContext}

User message: ${message}

Previous conversation:
${history?.slice(-5).map((m: any) => `${m.role}: ${m.content}`).join('\n') || 'None'}

Respond helpfully. If the user wants to find products, search through these products:
${allProducts.slice(0, 10).map((p: any) => `- ${p.name} ($${p.priceOptions[0]}) - ID: ${p.id}`).join('\n')}

If user wants to view a product, return navigation command: {"navigate": {"screen": "productPage", "params": {"productId": "PRODUCT_ID"}}}
If user wants to go home, return: {"navigate": {"screen": "home"}}
If user wants seller dashboard, return: {"navigate": {"screen": "seller"}}`;

    const responseText = await generateText(prompt);

    // Parse response for navigation commands
    let navigate: any = undefined;
    let foundProducts: any[] = [];
    let actions: any[] = [];

    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.navigate) {
          navigate = parsed.navigate;
        }
      }
    } catch {
      // Not JSON, continue with text response
    }

    // Search for products if mentioned
    const lowerMessage = message.toLowerCase();
    const matchingProducts = allProducts.filter((p: any) =>
      lowerMessage.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(lowerMessage.split(' ')[0]) ||
      p.description?.toLowerCase().includes(lowerMessage.split(' ')[0])
    ).slice(0, 5);
    
    if (matchingProducts.length > 0) {
      foundProducts = matchingProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.priceOptions[0] || 0,
      }));
    }

    return NextResponse.json({
      message: responseText || 'I\'m here to help! How can I assist you?',
      navigate,
      products: foundProducts.length > 0 ? foundProducts : undefined,
      actions,
    });
  } catch (error: any) {
    console.error('Assistant error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process assistant request' },
      { status: 500 }
    );
  }
}

