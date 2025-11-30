'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { AssistantChat } from './assistant-chat';
import { useWallet } from '@/hooks/use-wallet';
import { getUserRole } from '@/lib/onboarding';
import { useEffect } from 'react';

export function AssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { wallet } = useWallet();
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | null>(null);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

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
    </>
  );
}

