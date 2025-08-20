/**
 * Root Route Component
 *
 * This module defines the application's root route, which serves as the foundation
 * for the entire route hierarchy. It establishes:
 *
 * - HTML document structure and meta tags
 * - Global providers and application-wide components
 * - Error and not-found boundary components
 * - Theme initialization to prevent flash of unstyled content
 * - Development tools integration
 *
 * The root route wraps all other routes and provides essential context like
 * QueryClient for data fetching throughout the application.
 * @see {@link https://tanstack.com/router/latest/docs/guide/route-trees#the-root-route} - TanStack Router root routes
 */

/// <reference types="vite/client" />
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { NotFound } from "@/components/error/not-found";
import type { orpc } from "@/orpc/orpc-client";
import { Providers } from "@/providers";
import appCss from "@/styles/app.css?url";
import { seo } from "@atk/config/metadata";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useMemo, type ReactNode } from "react";
import { Toaster } from "sonner";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  orpc: typeof orpc;
}>()({
  head: () => ({
    meta: [
      {
        // eslint-disable-next-line unicorn/text-encoding-identifier-case
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

/**
 * Root component that renders the application structure.
 *
 * This component serves as the entry point for the route tree, wrapping
 * all child routes with the RootDocument component that provides the
 * HTML structure and global providers.
 */
function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

/**
 * Document wrapper component that provides the HTML structure.
 *
 * This component renders the complete HTML document including:
 * - Theme initialization script to prevent FOUC (Flash of Unstyled Content)
 * - Global providers for authentication, theming, and internationalization
 * - Development tools in development mode
 * - Toast notifications container
 *
 * The theme script runs before React hydration to immediately apply the
 * user's theme preference, preventing any visual flicker during page load.
 * @param children.children
 * @param children - The route content to render within the document
 */
function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
        {/**
         * Theme initialization script that runs before React hydration.
         * This prevents flash of unstyled content by immediately applying
         * the user's theme preference from localStorage or system settings.
         */}
        <script
          dangerouslySetInnerHTML={useMemo(
            () => ({
              __html: `
              (function() {
                // Storage key matches the one used by next-themes provider
                const storageKey = 'vite-ui-theme';
                const theme = localStorage.getItem(storageKey) || 'system';
                const root = document.documentElement;

                // Resolve 'system' theme to actual light/dark value
                let appliedTheme = theme;
                if (theme === 'system') {
                  appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                }

                // Apply theme class for CSS theme variables
                root.classList.add(appliedTheme);

                // Set background color immediately to prevent flash
                // Colors match --sm-background-lightest CSS variables
                if (appliedTheme === 'dark') {
                  root.style.backgroundColor = 'oklch(0.2809 0 0)'; // --sm-background-lightest dark
                  root.style.colorScheme = 'dark';
                } else {
                  root.style.backgroundColor = 'oklch(0.967 0.014 268.49)'; // --sm-background-lightest light
                  root.style.colorScheme = 'light';
                }
              })();
            `.trim(),
            }),
            []
          )}
        />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster richColors />
          <TanStackDevtools
            plugins={[
              {
                name: "Query",
                render: <ReactQueryDevtoolsPanel />,
              },
              {
                name: "Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
