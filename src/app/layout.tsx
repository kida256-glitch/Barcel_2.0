import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { AssistantButton } from '@/modules/ai-assistant/components/assistant-button';
import { AssistantProvider } from '@/modules/ai-assistant/context';

export const metadata: Metadata = {
  title: {
    default: 'Barcel',
    template: '%s | Barcel',
  },
  description: 'Barcel - A Web3 marketplace on Celo where buyers and sellers negotiate prices directly. Secure, transparent, and decentralized trading.',
  keywords: ['Barcel', 'Web3', 'Celo', 'Marketplace', 'Blockchain', 'NFT', 'Decentralized', 'Trading'],
  authors: [{ name: 'Barcel Team' }],
  creator: 'Barcel',
  publisher: 'Barcel',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Barcel - Web3 Marketplace on Celo',
    description: 'A Web3 marketplace on Celo where buyers and sellers negotiate prices directly. Secure, transparent, and decentralized trading.',
    siteName: 'Barcel',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barcel - Web3 Marketplace on Celo',
    description: 'A Web3 marketplace on Celo where buyers and sellers negotiate prices directly.',
    creator: '@barcel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('barcel_theme') || 'dark';
                  const root = document.documentElement;
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else {
                    root.classList.remove('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background')}>
        <ThemeProvider>
          <AssistantProvider>
            {children}
            <Toaster />
            <AssistantButton />
          </AssistantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
