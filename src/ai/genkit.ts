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

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
