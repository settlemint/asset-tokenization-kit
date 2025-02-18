import { QueryClientProvider } from '@/components/blocks/query-client/query-client-provider';
import { ThemeProvider } from '@/components/blocks/theme/theme-provider';
import { themeConfig } from '@/lib/config/theme';
import { cn } from '@/lib/utils';
import '@fontsource/figtree/300.css';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/700.css';
import '@fontsource/figtree/900.css';
import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import './globals.css';
export { metadata } from '../lib/config/metadata';

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
      <body className={cn('min-h-screen font-sans antialiased')}>
        <ThemeProvider
          attribute="class"
          enableColorScheme
          enableSystem
          value={{
            light: themeConfig.variant === 'settlemint' ? 'settlemint-light' : 'light',
            dark: themeConfig.variant === 'settlemint' ? 'settlemint-dark' : 'dark',
          }}
        >
          <QueryClientProvider>{children}</QueryClientProvider>
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
