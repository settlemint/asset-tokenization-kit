import { ThemeProvider } from "@/components/blocks/dark-mode/theme-provider";
import { QueryClientProvider } from "@/components/blocks/query-client/query-client-provider";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
export { metadata } from "@/lib/site-config";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen font-sans antialiased", fontSans.variable)}>
        <SessionProvider>
          <NuqsAdapter>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <QueryClientProvider>{children}</QueryClientProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </SessionProvider>
      </body>
    </html>
  );
}
