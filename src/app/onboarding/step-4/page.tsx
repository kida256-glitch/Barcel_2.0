import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingStep4() {
  return (
    <div className="flex flex-col items-center text-center p-8 max-w-md mx-auto h-full justify-center">
        <h2 className="text-3xl font-bold font-headline text-white mb-4">
            Secure Transactions
        </h2>
        <p className="text-lg text-muted-foreground mb-12">
            All transactions are powered by the secure and fast Celo network.
        </p>
        <div className="flex w-full justify-between items-center mt-auto">
            <Button variant="outline" size="icon" asChild>
                <Link href="/onboarding/step-3"><ArrowLeft /></Link>
            </Button>
            <div className="flex gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
                <span className="h-2 w-2 rounded-full bg-primary"></span>
            </div>
            <Button variant="default" size="icon" asChild>
                <Link href="/onboarding/role-selection"><Check /></Link>
            </Button>
        </div>
    </div>
  );
}
