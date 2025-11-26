'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Settings, Moon, Sun, Bell, Shield, Globe } from 'lucide-react';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { getTheme, setTheme, type Theme } from '@/lib/theme';

export function PreferencesDialog() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Load theme preference on mount
  useEffect(() => {
    const currentTheme = getTheme();
    setDarkMode(currentTheme === 'dark');
  }, []);

  const handleThemeChange = (checked: boolean) => {
    const newTheme: Theme = checked ? 'dark' : 'light';
    setTheme(newTheme);
    setDarkMode(checked);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Preferences</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences
          </DialogTitle>
          <DialogDescription>
            Manage your app preferences and settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Appearance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Appearance</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="flex items-center gap-2">
                  {darkMode ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about offers and updates
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-updates">Email Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get updates via email
                </p>
              </div>
              <Switch
                id="email-updates"
                checked={emailUpdates}
                onCheckedChange={setEmailUpdates}
              />
            </div>
          </div>

          <Separator />

          {/* Privacy & Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Privacy & Security</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your wallet connection and transaction data are stored locally on your device.
              </p>
              <p className="text-sm text-muted-foreground">
                We never store your private keys or sensitive information.
              </p>
            </div>
          </div>

          <Separator />

          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">About</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Barcel v1.0.0
              </p>
              <p className="text-sm text-muted-foreground">
                Built on the Celo blockchain for secure, transparent trading.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

