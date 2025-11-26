'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ShoppingCart, Store, Handshake, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingStep2() {
  return (
    <div className="flex flex-col items-center text-center p-4 sm:p-6 md:p-8 max-w-4xl mx-auto min-h-[60vh] justify-center perspective-1000">
      <div className="mb-6 sm:mb-8 animate-float">
        <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-2xl shadow-primary/20 animate-pulse-3d">
          <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-primary animate-rotate-3d" />
        </div>
      </div>
      <div className="space-y-6 sm:space-y-8 animate-slide-in-3d px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-gradient-animated mb-4 sm:mb-6">
          What is Barcel?
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
          Barcel is a revolutionary Web3 marketplace built on the Celo blockchain where buyers and sellers can negotiate prices directly. 
          Whether you're looking to buy unique items or sell your products, Barcel makes bargaining simple, secure, and transparent.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 md:p-8 rounded-xl border border-primary/20 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm shadow-xl shadow-primary/5 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 card-3d">
            <div className="flex items-center justify-center mb-3 sm:mb-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse-3d">
                <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-primary transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-headline mb-2 sm:mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              For Buyers
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Browse products, make offers, and negotiate prices directly with sellers. You control what you pay.
            </p>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8 rounded-xl border border-accent/20 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm shadow-xl shadow-accent/5 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-accent/20 hover:border-accent/40 card-3d">
            <div className="flex items-center justify-center mb-3 sm:mb-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center shadow-lg shadow-accent/20 animate-pulse-3d">
                <Store className="h-8 w-8 sm:h-10 sm:w-10 text-accent transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-headline mb-2 sm:mb-3 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              For Sellers
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              List your products, set multiple price options, and accept offers from buyers. Grow your business.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Handshake className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            <span>Fair Negotiation</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            <span>Secure & Transparent</span>
          </div>
        </div>
      </div>
      
      <div className="flex w-full justify-between items-center mt-8 sm:mt-12 pt-6 sm:pt-8 px-4">
        <Button variant="outline" size="icon" asChild className="h-9 w-9 sm:h-10 sm:w-10">
          <Link href="/onboarding/step-1"><ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" /></Link>
        </Button>
        <div className="flex gap-2">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
          <span className="h-2 w-2 rounded-full bg-primary"></span>
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50"></span>
        </div>
        <Button variant="default" size="icon" asChild className="h-9 w-9 sm:h-10 sm:w-10">
          <Link href="/onboarding/role-selection"><ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" /></Link>
        </Button>
      </div>
    </div>
  );
}
