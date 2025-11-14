'use server';

/**
 * @fileOverview Summarizes seller reviews to provide a quick assessment of the seller's reputation.
 *
 * - summarizeSellerReviews - A function that summarizes seller reviews.
 * - SummarizeSellerReviewsInput - The input type for the summarizeSellerReviews function.
 * - SummarizeSellerReviewsOutput - The return type for the summarizeSellerReviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSellerReviewsInputSchema = z.object({
  reviews: z.array(z.string()).describe('An array of seller reviews.'),
});
export type SummarizeSellerReviewsInput = z.infer<typeof SummarizeSellerReviewsInputSchema>;

const SummarizeSellerReviewsOutputSchema = z.object({
  summary: z.string().describe('A summary of the seller reviews.'),
});
export type SummarizeSellerReviewsOutput = z.infer<typeof SummarizeSellerReviewsOutputSchema>;

export async function summarizeSellerReviews(input: SummarizeSellerReviewsInput): Promise<SummarizeSellerReviewsOutput> {
  return summarizeSellerReviewsFlow(input);
}

const summarizeSellerReviewsPrompt = ai.definePrompt({
  name: 'summarizeSellerReviewsPrompt',
  input: {schema: SummarizeSellerReviewsInputSchema},
  output: {schema: SummarizeSellerReviewsOutputSchema},
  prompt: `Summarize the following seller reviews into a concise summary that captures the overall sentiment and key points:\n\nReviews:\n{{#each reviews}}- {{{this}}}\n{{/each}}\n\nSummary:`,
});

const summarizeSellerReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeSellerReviewsFlow',
    inputSchema: SummarizeSellerReviewsInputSchema,
    outputSchema: SummarizeSellerReviewsOutputSchema,
  },
  async input => {
    const {output} = await summarizeSellerReviewsPrompt(input);
    return output!;
  }
);
