import { CeloBargainLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OnboardingStep1() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <CeloBargainLogo className="h-32 w-32 text-accent mb-8" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
            Welcome to CeloBargain
        </h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-md">
            The revolutionary marketplace where you negotiate prices for unique items.
        </p>
        <Button size="lg" asChild>
            <Link href="/onboarding/step-2">Get Started</Link>
        </Button>
    </div>
  );
}
