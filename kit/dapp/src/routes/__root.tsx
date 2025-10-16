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
import {
  compileThemeCSS,
  resolveFontLinks,
  resolveFontVariables,
  hashTheme,
  type ResolvedFontLink,
  type FontVariables,
} from "@/components/theme/compile-css";
import { DEFAULT_THEME, type ThemeConfig } from "@/components/theme/schema";
import {
  getThemeCssFromCache,
  setThemeCssCache,
} from "@/components/theme/theme-css-cache";
import { patchBigIntToJSON } from "@/lib/utils/json";
import type { orpc } from "@/orpc/orpc-client";
import { Providers } from "@/providers";
import appCss from "@/styles/app.css?url";
import { seo } from "@atk/config/metadata";
import "@fontsource-variable/figtree";
import "@fontsource-variable/roboto-mono";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtools } from "@tanstack/react-form-devtools";
import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import {
  useMemo,
  type ReactNode,
  type DetailedHTMLProps,
  type LinkHTMLAttributes,
} from "react";
import { Toaster } from "sonner";

patchBigIntToJSON();

type LinkDescriptor = DetailedHTMLProps<
  LinkHTMLAttributes<HTMLLinkElement>,
  HTMLLinkElement
>;

type RootLoaderData = {
  theme: ThemeConfig;
  themeHash: string;
  themeCss: string;
  fontLinks: ResolvedFontLink[];
  fontVariables: FontVariables;
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  orpc: typeof orpc;
}>()({
  loader: async ({ context }): Promise<RootLoaderData> => {
    const { queryClient, orpc } = context;

    try {
      const theme = await queryClient.ensureQueryData(
        orpc.settings.theme.get.queryOptions({ input: {} })
      );
      const hash = hashTheme(theme);
      const cachedCss = await getThemeCssFromCache(hash);
      const css = cachedCss ?? compileThemeCSS(theme);

      if (!cachedCss) {
        await setThemeCssCache(hash, css);
      }

      return {
        theme,
        themeHash: hash,
        themeCss: css,
        fontLinks: resolveFontLinks(theme.fonts),
        fontVariables: resolveFontVariables(theme.fonts),
      };
    } catch {
      const hash = hashTheme(DEFAULT_THEME);
      const cachedCss = await getThemeCssFromCache(hash);
      const css = cachedCss ?? compileThemeCSS(DEFAULT_THEME);

      if (!cachedCss) {
        await setThemeCssCache(hash, css);
      }

      return {
        theme: DEFAULT_THEME,
        themeHash: hash,
        themeCss: css,
        fontLinks: resolveFontLinks(DEFAULT_THEME.fonts),
        fontVariables: resolveFontVariables(DEFAULT_THEME.fonts),
      };
    }
  },
  head: ({ loaderData }) => {
    const baseMeta = [
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
    ];

    const baseLinks = [
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
    ];

    const resolvedFontLinks =
      loaderData?.fontLinks ?? resolveFontLinks(DEFAULT_THEME.fonts);
    const fontLinks: LinkDescriptor[] = resolvedFontLinks.map((link) => ({
      rel: link.rel,
      href: link.href,
      crossOrigin: link.crossOrigin,
    }));

    return {
      meta: baseMeta,
      links: [...baseLinks, ...fontLinks],
    };
  },
  errorComponent: (props) => {
    return (
      <RootDocument
        theme={DEFAULT_THEME}
        initialThemeCss={compileThemeCSS(DEFAULT_THEME)}
        initialThemeHash={hashTheme(DEFAULT_THEME)}
        fontVariables={resolveFontVariables(DEFAULT_THEME.fonts)}
      >
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
  const { theme, themeHash, themeCss, fontVariables } = Route.useLoaderData();
  return (
    <RootDocument
      theme={theme}
      initialThemeCss={themeCss}
      initialThemeHash={themeHash}
      fontVariables={fontVariables}
    >
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
 * @param initialThemeCss - Precompiled CSS overrides for persisted theme
 */
function RootDocument({
  children,
  theme,
  initialThemeCss,
  initialThemeHash,
  fontVariables,
}: Readonly<{
  children: ReactNode;
  theme: ThemeConfig;
  initialThemeCss?: string;
  initialThemeHash?: string;
  fontVariables?: FontVariables;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
        {initialThemeCss ? (
          <style
            id="theme-overrides"
            data-origin="persisted"
            data-hash={initialThemeHash}
            dangerouslySetInnerHTML={useMemo(
              () => ({
                __html: initialThemeCss,
              }),
              [initialThemeCss]
            )}
          />
        ) : null}
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
                root.classList.remove("light", "dark");
                root.classList.add(appliedTheme);
                root.dataset.theme = appliedTheme;
                root.dataset.themeMode = theme;

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
        <Providers
          theme={theme}
          themeHash={initialThemeHash}
          fontVariables={fontVariables}
        >
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
              {
                name: "Form",
                render: <FormDevtools />,
              },
            ]}
          />
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
