'use client';

import { CeloBargainLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingStep1() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 max-w-2xl mx-auto min-h-[60vh] perspective-1000">
      <div className="mb-8 sm:mb-10 md:mb-12 animate-float">
        <div className="relative">
          <CeloBargainLogo className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-64 lg:w-64 text-accent mx-auto transition-all duration-1000 hover:scale-110 hover:rotate-12" />
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl opacity-50 animate-pulse-3d" />
        </div>
      </div>
      <div className="space-y-6 sm:space-y-8 animate-slide-in-3d px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-headline bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-gradient-animated animate-float">
          Barcel
        </h1>
        <Button 
          size="lg" 
          className="group mt-6 sm:mt-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/40 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto" 
          asChild
        >
          <Link href="/onboarding/step-2">
            Continue
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
