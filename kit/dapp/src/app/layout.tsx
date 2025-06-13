import { Providers } from "@/components/providers/Providers";
import { ClientToaster } from "@/components/ui/toaster";
import { Translation } from "@/i18n/translation";
import "@/lib/orpc/orpc.server";
import { cn } from "@/lib/utils";
import type { Viewport } from "next";
import { Figtree, Roboto_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getLangDir } from "rtl-detect";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e1eafd" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1c1c" },
  ],
};

export { metadata } from "@/lib/config/metadata";

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
}: Readonly<{ children: ReactNode }>) {
  try {
    // Get locale from Translation provider
    const locale = Translation.locale || "en";
    const direction = getLangDir(locale);

    // Ensure that the incoming `locale` is valid
    if (!Translation.locales.includes(locale)) {
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
          <Translation>
            <Providers>
              {children}
              <ClientToaster />
            </Providers>
          </Translation>
        </body>
      </html>
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}
