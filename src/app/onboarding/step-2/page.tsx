import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OnboardingStep2() {
  return (
    <div className="flex flex-col items-center text-center p-8">
        <Image 
            src="https://picsum.photos/seed/onboarding2/400/300" 
            alt="Bargaining illustration"
            width={400}
            height={300}
            className="rounded-lg mb-8 shadow-lg"
            data-ai-hint="deal handshake"
        />
        <h2 className="text-3xl font-bold font-headline text-white mb-4">
            Find and Bargain
        </h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-md">
            Discover amazing products and make offers. You set the price you're willing to pay.
        </p>
        <div className="flex w-full justify-between items-center">
            <Button variant="outline" size="icon" asChild>
                <Link href="/onboarding/step-1"><ArrowLeft /></Link>
            </Button>
            <div className="flex gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
            </div>
            <Button variant="default" size="icon" asChild>
                <Link href="/onboarding/step-3"><ArrowRight /></Link>
            </Button>
        </div>
    </div>
  );
}
