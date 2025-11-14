'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Wallet, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const mockAddress = '0x1a2b...c3d4';

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://picsum.photos/seed/wallet/40/40`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">{mockAddress}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsConnected(false)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={() => setIsConnected(true)}
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
