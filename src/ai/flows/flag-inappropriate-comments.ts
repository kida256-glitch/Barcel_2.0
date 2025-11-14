'use server';

/**
 * @fileOverview A flow that flags potentially inappropriate comments.
 *
 * - flagInappropriateComment - A function that flags inappropriate comments.
 * - FlagInappropriateCommentInput - The input type for the flagInappropriateComment function.
 * - FlagInappropriateCommentOutput - The return type for the flagInappropriateComment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlagInappropriateCommentInputSchema = z.object({
  comment: z.string().describe('The comment to be checked.'),
});
export type FlagInappropriateCommentInput = z.infer<typeof FlagInappropriateCommentInputSchema>;

const FlagInappropriateCommentOutputSchema = z.object({
  is_inappropriate: z.boolean().describe('Whether the comment is inappropriate or not.'),
  reason: z.string().describe('The reason why the comment is inappropriate.'),
});
export type FlagInappropriateCommentOutput = z.infer<typeof FlagInappropriateCommentOutputSchema>;

export async function flagInappropriateComment(
  input: FlagInappropriateCommentInput
): Promise<FlagInappropriateCommentOutput> {
  return flagInappropriateCommentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'flagInappropriateCommentPrompt',
  input: {schema: FlagInappropriateCommentInputSchema},
  output: {schema: FlagInappropriateCommentOutputSchema},
  prompt: `You are a content moderation expert. Your job is to determine whether user-generated comments are inappropriate based on the following criteria: hate speech, harassment, sexually explicit content, dangerous content.

  Analyze the following comment and decide whether it is inappropriate or not, and provide a brief explanation.
  Comment: {{{comment}}}`,
});

const flagInappropriateCommentFlow = ai.defineFlow(
  {
    name: 'flagInappropriateCommentFlow',
    inputSchema: FlagInappropriateCommentInputSchema,
    outputSchema: FlagInappropriateCommentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
