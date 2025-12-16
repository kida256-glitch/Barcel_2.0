import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Configure genkit for flows (used by summarizeSellerReviews and flagInappropriateComment)
export const ai = genkit({
  plugins: [googleAI()],
  logLevel: 'info',
  enableFlowServer: true,
});

// Helper function to generate text using Google GenAI directly
// This is used by API routes for simple text generation
export async function generateText(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error('GOOGLE_GENAI_API_KEY is not set');
  }

  // If configured to use Anthropic / Claude, call Anthropic's API directly.
  // Enable by setting `AI_PROVIDER=anthropic` or `USE_CLAUDE=true` and
  // `ANTHROPIC_API_KEY` in the environment.
  const useAnthropic = (process.env.AI_PROVIDER === 'anthropic') || (process.env.USE_CLAUDE === 'true');
  if (useAnthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const res = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4.5',
        prompt,
        max_tokens_to_sample: 800,
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Anthropic API error: ${res.status} ${text}`);
    }

    const data = await res.json();
    // Anthropic responses commonly include `completion`.
    const completion = data?.completion ?? data?.output ?? data?.text ?? JSON.stringify(data);
    return completion;
  }

  // Default: use Google GenAI
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
