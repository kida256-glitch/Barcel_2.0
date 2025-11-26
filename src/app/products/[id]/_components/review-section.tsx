'use client';
import { handleNewReview, handleSummarizeReviews } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { addReview, getProductById } from '@/lib/store';
import { useWallet } from '@/hooks/use-wallet';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface ReviewSectionProps {
  product: Product & { reviews: any[] };
}

const FormSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.'),
  comment: z.string().min(10, 'Comment must be at least 10 characters.'),
});

function StarRating({
  rating,
  setRating,
  disabled = false,
}: {
  rating: number;
  setRating?: (rating: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-400'
          } ${setRating && !disabled ? 'cursor-pointer' : ''}`}
          onClick={() => setRating && !disabled && setRating(star)}
        />
      ))}
    </div>
  );
}


export function ReviewSection({ product }: ReviewSectionProps) {
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [reviews, setReviews] = useState(product.reviews || []);
  const { toast } = useToast();
  const { wallet } = useWallet();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  // Refresh reviews when product changes
  useEffect(() => {
    const updatedProduct = getProductById(product.id);
    if (updatedProduct) {
      setReviews(updatedProduct.reviews || []);
    }
  }, [product.id]);

  const generateSummary = async () => {
    setIsLoadingSummary(true);
    const reviewComments = reviews.map((r) => r.comment);
    const result = await handleSummarizeReviews(reviewComments);
    setSummary(result.summary);
    setIsLoadingSummary(false);
  };
  
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!wallet?.address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to submit a review.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First, validate with server action (for content moderation)
      const formData = new FormData();
      formData.append('rating', String(data.rating));
      formData.append('comment', data.comment);

      const result = await handleNewReview(null, formData);
      
      if (!result.message.includes('successfully')) {
        toast({
          title: result.message,
          variant: 'destructive',
        });
        return;
      }

      // If validation passes, save to store
      const newReview = addReview(product.id, {
        productId: product.id,
        author: wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4), // Use wallet address as author
        rating: data.rating,
        comment: data.comment,
      });

      if (newReview) {
        // Refresh the product to get updated reviews
        const updatedProduct = getProductById(product.id);
        if (updatedProduct) {
          setReviews(updatedProduct.reviews || []);
        }

        toast({
          title: 'Review Submitted!',
          description: 'Your review has been saved and will be visible to the seller.',
        });

        form.reset();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save review. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while submitting your review.',
        variant: 'destructive',
      });
    }
  }


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold font-headline text-center text-primary">
        Buyer Reviews & Ratings
      </h2>

      {/* AI Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-accent" />
            <span>AI-Powered Review Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary ? (
            <p className="text-muted-foreground">{summary}</p>
          ) : (
            <>
              {isLoadingSummary ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center text-center gap-4 p-4'>
                    <p className="text-muted-foreground">
                        Click the button to generate a TL;DR summary of all reviews using AI.
                    </p>
                    <Button onClick={generateSummary}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Summary
                    </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Review List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <Card className="bg-card/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="bg-card/50 border-primary/10 hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{review.author.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{review.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

       {/* Add Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Rating</FormLabel>
                    <FormControl>
                        <div className="pt-2">
                            <StarRating rating={field.value} setRating={field.onChange} />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Sparkles className="mr-2 h-4 w-4 animate-pulse" />}
                Submit Review
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

    </div>
  );
}
