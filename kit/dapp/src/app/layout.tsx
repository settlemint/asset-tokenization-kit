import { AuthProvider } from "@/components/blocks/auth/auth-provider";
import { ThemeProvider } from "@/components/blocks/theme/theme-provider";
import { TransitionProvider } from "@/components/layout/transition-provider";
import { routing } from "@/i18n/routing";
import { getServerEnvironment } from "@/lib/config/environment";
import { cn } from "@/lib/utils";
import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Figtree, Roboto_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getLangDir } from "rtl-detect";
import { Toaster } from "sonner";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export { metadata } from "@/lib/config/metadata";

const timeZone = "Europe/Brussels";

const figTree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  try {
    const locale = await getLocale();
    const direction = getLangDir(locale);
    const env = getServerEnvironment();

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale)) {
      notFound();
    }

    return (
      <html
        lang={locale}
        dir={direction}
        className={cn(figTree.variable, robotoMono.variable)}
        suppressHydrationWarning
      >
        {/* Can be used to debug rerenders using react-scan
      <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
      </head> */}
        <body className="min-h-screen antialiased">
          <NextIntlClientProvider timeZone={timeZone}>
            <ThemeProvider attribute="class" enableColorScheme enableSystem>
              <TransitionProvider>
                <AuthProvider
                  emailEnabled={!!env.RESEND_API_KEY}
                  googleEnabled={
                    !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
                  }
                  githubEnabled={
                    !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
                  }
                >
                  {children}
                </AuthProvider>
              </TransitionProvider>
            </ThemeProvider>
            <Toaster richColors />
          </NextIntlClientProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}
