'use client';

import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { useAssistant } from '../context';

export function AssistantButton() {
  const { openAssistant } = useAssistant();

  return (
    <Button
      onClick={openAssistant}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 bg-primary hover:bg-primary/90"
      size="icon"
    >
      <Bot className="h-6 w-6" />
    </Button>
  );
}

