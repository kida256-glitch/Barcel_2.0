'use server';

import { flagInappropriateComment } from '@/ai/flows/flag-inappropriate-comments';
import { summarizeSellerReviews } from '@/ai/flows/summarize-seller-reviews';
import { z } from 'zod';

export async function handleSummarizeReviews(reviews: string[]) {
  try {
    const summary = await summarizeSellerReviews({ reviews });
    return { success: true, summary: summary.summary };
  } catch (error) {
    console.error('Error summarizing reviews:', error);
    return {
      success: false,
      summary: 'Could not generate summary at this time.',
    };
  }
}

const reviewSchema = z.object({
  comment: z.string().min(10, 'Comment must be at least 10 characters long.'),
  rating: z.number().min(1).max(5),
});

export async function handleNewReview(prevState: any, formData: FormData) {
  const validatedFields = reviewSchema.safeParse({
    comment: formData.get('comment'),
    rating: Number(formData.get('rating')),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
    };
  }

  const { comment } = validatedFields.data;

  try {
    const moderation = await flagInappropriateComment({ comment });
    if (moderation.is_inappropriate) {
      return {
        message: `Your comment was flagged as inappropriate: ${moderation.reason}. Please revise.`,
      };
    }
    // In a real app, you would save the review to the database here.
    return { message: 'Review submitted successfully! Thank you.', reset: true };
  } catch (error) {
    console.error('Error handling new review:', error);
    return { message: 'An error occurred while submitting your review.' };
  }
}
