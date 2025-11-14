import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OnboardingStep3() {
  return (
    <div className="flex flex-col items-center text-center p-8">
        <Image 
            src="https://picsum.photos/seed/onboarding3/400/300" 
            alt="Seller approving an offer"
            width={400}
            height={300}
            className="rounded-lg mb-8 shadow-lg"
            data-ai-hint="agreement deal"
        />
        <h2 className="text-3xl font-bold font-headline text-white mb-4">
            Sellers Accept
        </h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-md">
            Sellers review your offers and can accept them, creating a fair deal for both parties.
        </p>
        <div className="flex w-full justify-between items-center">
            <Button variant="outline" size="icon" asChild>
                <Link href="/onboarding/step-2"><ArrowLeft /></Link>
            </Button>
            <div className="flex gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
            </div>
            <Button variant="default" size="icon" asChild>
                <Link href="/onboarding/step-4"><ArrowRight /></Link>
            </Button>
        </div>
    </div>
  );
}
