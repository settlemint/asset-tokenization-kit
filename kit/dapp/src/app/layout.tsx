import { QueryClientProvider } from '@/components/blocks/query-client/query-client-provider';
import { ThemeProvider } from '@/components/blocks/theme/theme-provider';
import { fontSans } from '@/lib/fonts';
import { theme } from '@/lib/site-config';
import { cn } from '@/lib/utils';
import type { Viewport } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import './styles/globals.css';
export { metadata } from '@/lib/site-config';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen font-sans antialiased', fontSans.variable)}>
        <NuqsAdapter>
          <ThemeProvider
            themes={theme === 'settlemint' ? ['settlemint-light', 'settlemint-dark'] : ['light', 'dark']}
            attribute="class"
            defaultTheme={theme === 'settlemint' ? 'settlemint-light' : 'light'}
            enableColorScheme
            disableTransitionOnChange
          >
            <QueryClientProvider>{children}</QueryClientProvider>
          </ThemeProvider>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}
