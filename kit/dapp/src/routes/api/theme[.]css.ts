/**
 * Theme CSS Endpoint
 *
 * Serves compiled CSS from the theme configuration stored in the database.
 * Provides caching headers and ETag support for optimal performance.
 *
 * Features:
 * - Fetches theme from database (falls back to defaults)
 * - Compiles theme to CSS with proper :root and .dark selectors
 * - Returns CSS with appropriate Content-Type header
 * - Includes ETag for cache validation
 * - Sets Cache-Control for CDN/browser caching
 *
 * Method: GET /api/theme.css
 */

import { compileThemeCSS, hashTheme } from "@/components/theme/lib/compile-css";
import { getTheme } from "@/components/theme/lib/repository";
import {
  getThemeCssFromCache,
  setThemeCssCache,
} from "@/components/theme/lib/theme-css-cache";
import type { AnyServerRouteWithTypes } from "@tanstack/start-server-core";
import { createServerFileRoute } from "@tanstack/react-start/server";

declare module "@tanstack/start-server-core" {
  interface ServerFileRoutesByPath {
    "/api/theme.css": {
      parentRoute: AnyServerRouteWithTypes;
      id: string;
      path: string;
      fullPath: string;
      children: unknown;
    };
  }
}

/**
 * Handles GET requests for theme CSS
 */
async function handleGet() {
  const theme = await getTheme();
  const hash = hashTheme(theme);
  const cachedCss = await getThemeCssFromCache(hash);
  const css = cachedCss ?? compileThemeCSS(theme);

  if (!cachedCss) {
    await setThemeCssCache(hash, css);
  }

  return new Response(css, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      ETag: `"${hash}"`,
    },
  });
}

export const ServerRoute = createServerFileRoute("/api/theme.css").methods({
  GET: handleGet,
});
