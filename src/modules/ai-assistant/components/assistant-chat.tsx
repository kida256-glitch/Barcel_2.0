'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, X } from 'lucide-react';
import { sendAssistantMessage } from '../services';
import type { AssistantMessage, AssistantResponse } from '../types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AssistantChatProps {
  onClose: () => void;
  context?: {
    currentScreen?: string;
    userRole?: 'buyer' | 'seller';
    walletAddress?: string;
  };
}

export function AssistantChat({ onClose, context }: AssistantChatProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI assistant. How can I help you today? I can help you find products, explain how CELO escrow works, assist with negotiations, and more!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AssistantMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: AssistantResponse = await sendAssistantMessage({
        message: input.trim(),
        context,
        history: messages,
      });

      const assistantMessage: AssistantMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Handle navigation
      if (response.navigate) {
        if (response.navigate.screen === 'productPage' && response.navigate.params?.productId) {
          router.push(`/products/${response.navigate.params.productId}`);
          toast({
            title: 'Navigating...',
            description: 'Taking you to the product page',
          });
        } else if (response.navigate.screen === 'home') {
          router.push('/');
        } else if (response.navigate.screen === 'seller') {
          router.push('/seller');
        }
      }

      // Handle actions
      if (response.actions) {
        response.actions.forEach((action) => {
          if (action.type === 'view_product' && action.data?.productId) {
            router.push(`/products/${action.data.productId}`);
          }
        });
      }

      // Show products if any
      if (response.products && response.products.length > 0) {
        toast({
          title: 'Products Found',
          description: `Found ${response.products.length} product(s)`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">AI Assistant</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <Card
                  className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                </Card>
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <p className="text-sm">Thinking...</p>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything..."
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

