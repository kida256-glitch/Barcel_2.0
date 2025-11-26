'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Zap, Lock } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingStep4() {
  return (
    <div className="flex flex-col items-center text-center p-8 max-w-2xl mx-auto h-full justify-center">
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
          <Lock className="h-16 w-16 text-primary" />
        </div>
      </div>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
        <h2 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
          Secure & Fast
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
          All transactions are powered by the secure and fast Celo network. Low fees, instant settlements, and full transparency.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            <span>Fast Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent" />
            <span>Blockchain Secured</span>
          </div>
        </div>
      </div>
      <div className="flex w-full justify-between items-center mt-auto pt-8">
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
