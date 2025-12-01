'use client';

import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AssistantChat } from './components/assistant-chat';
import { useWallet } from '@/hooks/use-wallet';
import { getUserRole } from '@/lib/onboarding';

interface AssistantContextValue {
  isOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
}

const AssistantContext = createContext<AssistantContextValue | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { wallet } = useWallet();
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | null>(null);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openAssistant: () => setIsOpen(true),
      closeAssistant: () => setIsOpen(false),
      toggleAssistant: () => setIsOpen(prev => !prev),
    }),
    [isOpen]
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
      {isOpen && (
        <AssistantChat
          onClose={() => setIsOpen(false)}
          context={{
            currentScreen: typeof window !== 'undefined' ? window.location.pathname : undefined,
            userRole: userRole || undefined,
            walletAddress: wallet?.address,
          }}
        />
      )}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within AssistantProvider');
  }
  return context;
}

