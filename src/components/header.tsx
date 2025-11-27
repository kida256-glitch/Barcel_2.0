'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CeloBargainLogo } from './icons';
import { WalletConnect } from './wallet-connect';
import { Button } from './ui/button';
import { Home, Users, Settings } from 'lucide-react';
import { PreferencesDialog } from './preferences-dialog';
import { getUserRole, type UserRole } from '@/lib/onboarding';

export function Header() {
  const pathname = usePathname();
  const isOnboarding = pathname?.startsWith('/onboarding');
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);

  useEffect(() => {
    // Get user role from localStorage
    const role = getUserRole();
    setUserRoleState(role);
  }, [pathname]); // Update when pathname changes (user might have switched roles)

  // Determine home URL based on user role
  const homeUrl = userRole === 'seller' ? '/seller' : '/';

  // Don't show navigation buttons on onboarding pages
  if (isOnboarding) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center px-2 sm:px-4">
          <div className="mr-2 sm:mr-4 flex min-w-0">
            <Link href="/onboarding/role-selection" className="mr-2 sm:mr-6 flex items-center space-x-1 sm:space-x-2 min-w-0">
              <CeloBargainLogo className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
              <span className="font-bold font-headline text-sm sm:text-base truncate">
                Barcel
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end min-w-0">
            <WalletConnect />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm shadow-lg shadow-primary/5">
      <div className="container flex h-14 items-center px-2 sm:px-4">
        <div className="mr-2 sm:mr-4 flex min-w-0 flex-shrink-0">
          <Link 
            href="/onboarding/role-selection" 
            className="mr-2 sm:mr-6 flex items-center space-x-1 sm:space-x-2 group/logo transition-all duration-300 hover:scale-105 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <CeloBargainLogo className="h-5 w-5 sm:h-6 sm:w-6 text-accent transition-all duration-300 group-hover/logo:rotate-12 group-hover/logo:scale-110" />
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-bold font-headline text-sm sm:text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
              Barcel
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center gap-1 sm:gap-2 min-w-0 overflow-hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 px-1 sm:px-2 md:px-3 text-xs sm:text-sm"
          >
            <Link href={homeUrl}>
              <Home className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 transition-transform duration-300 group-hover:rotate-12 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Home</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="transition-all duration-300 hover:scale-105 hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/20 px-1 sm:px-2 md:px-3 text-xs sm:text-sm"
          >
            <Link href="/onboarding/role-selection">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 transition-transform duration-300 group-hover:rotate-12 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Switch Role</span>
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
          <PreferencesDialog />
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
