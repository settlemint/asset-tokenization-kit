import { ThemeProvider } from "@/components/blocks/theme/theme-provider";
import { TransitionProvider } from "@/components/layout/transition-provider";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Figtree, Roboto_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const figTree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const geistMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn(figTree.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      {/* Can be used to debug rerenders using react-scan
      <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
      </head> */}
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" enableColorScheme enableSystem>
            <TransitionProvider>{children}</TransitionProvider>
          </ThemeProvider>
          <Toaster richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
