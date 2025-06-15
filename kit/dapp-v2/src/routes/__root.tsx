/// <reference types="vite/client" />
import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";

import type { ReactNode } from "react";

import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { NotFound } from "@/components/error/not-found";
import { seo } from "@/config/metadata";
import { Providers } from "@/providers";
import appCss from "@/styles/app.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "color-scheme",
        content: "light dark",
      },
      ...seo({}),
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/favicon-96x96.png",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/site.webmanifest", color: "#ffffff" },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const storageKey = 'vite-ui-theme';
                const theme = localStorage.getItem(storageKey) || 'system';
                const root = document.documentElement;

                let appliedTheme = theme;
                if (theme === 'system') {
                  appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                }

                root.classList.add(appliedTheme);

                // Set background color immediately to prevent flash
                if (appliedTheme === 'dark') {
                  root.style.backgroundColor = 'oklch(0.2809 0 0)'; // --sm-background-lightest dark
                  root.style.colorScheme = 'dark';
                } else {
                  root.style.backgroundColor = 'oklch(0.967 0.014 268.49)'; // --sm-background-lightest light
                  root.style.colorScheme = 'light';
                }
              })();
            `.trim(),
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster richColors />
          <TanStackRouterDevtools initialIsOpen={false} />
          <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
