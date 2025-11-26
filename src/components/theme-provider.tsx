'use client';

import { useEffect } from 'react';
import { initTheme } from '@/lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize theme on mount
    initTheme();
  }, []);

  return <>{children}</>;
}

