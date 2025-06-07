import { Providers } from "@/components/providers/Providers";
import { ClientToaster } from "@/components/ui/toaster";
import { routing } from "@/i18n/routing";
import "@/lib/orpc/orpc.server";
import { cn } from "@/lib/utils";
import { zodErrorMap } from "@/lib/utils/zod/error-map";
import type { Viewport } from "next";
import { getLocale } from "next-intl/server";
import { Figtree, Roboto_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getLangDir } from "rtl-detect";
import { z } from "zod";
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

//set the error map globally
z.setErrorMap(zodErrorMap);

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  try {
    const locale = await getLocale();
    const direction = getLangDir(locale);

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
          <Providers>
            {children}
            <ClientToaster />
          </Providers>
        </body>
      </html>
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}
