import i18n, { fallbackLng } from "@/lib/i18n";
import type { TOptions } from "i18next";
import { baseRouter } from "../../procedures/base.router";
import type { i18nContext } from "./i18n.middleware";

/**
 * Creates an i18n middleware that preloads specific namespaces.
 *
 * This is more efficient than the general i18n middleware when you know
 * exactly which namespaces a route will use. It only loads the required
 * namespaces instead of all common ones.
 *
 * @param namespaces - Array of namespace names to preload
 * @returns Middleware that provides translation function with preloaded namespaces
 *
 * @example
 * ```typescript
 * // In a route that only needs token translations
 * export const mintToken = tokenRouter
 *   .use(i18nWithNamespaces(['tokens', 'errors']))
 *   .handler(async ({ context }) => {
 *     const { t } = context;
 *     // Only 'tokens' and 'errors' namespaces are preloaded
 *   });
 * ```
 */
export function i18nWithNamespaces(namespaces: readonly string[]) {
  return baseRouter.middleware(async ({ context, next }) => {
    // Get language from Accept-Language header, default to fallback language (English)
    const acceptLanguage = context.headers["accept-language"];
    const language =
      acceptLanguage?.split(",")[0]?.split("-")[0] ?? fallbackLng;

    // Preload only the specified namespaces for this language
    await Promise.all([
      // Load the language if not already loaded
      i18n.loadLanguages(language).catch(() => {
        // Fall back to default language if loading fails
      }),
      // Load the specified namespaces
      ...namespaces.map(async (ns) =>
        i18n.loadNamespaces(ns).catch(() => {
          // Silently ignore errors - the namespace might not exist for all languages
        })
      ),
    ]);

    // Create a translation function with preloaded namespaces
    const t = (key: string, options?: TOptions): string => {
      // Create a wrapper that accepts any string key but maintains type safety for options
      const translate = i18n.getFixedT(language) as (
        key: string,
        options?: TOptions
      ) => unknown;
      const result = translate(key, options);
      // TFunction can return string | object | null | detailed result
      // In our case, we're using it for simple string translations
      return typeof result === "string" ? result : String(result);
    };

    return next({
      context: {
        // Pass the language for potential downstream use
        language,
        // Provide the translation function
        t,
      } satisfies i18nContext,
    });
  });
}

/**
 * Specialized i18n middleware for token operations.
 * Preloads only token-related namespaces.
 */
export const i18nTokenMiddleware = i18nWithNamespaces([
  "tokens",
  "errors",
  "validation",
  "common",
] as const);

/**
 * Specialized i18n middleware for system operations.
 * Preloads only system-related namespaces.
 */
export const i18nSystemMiddleware = i18nWithNamespaces([
  "system",
  "errors",
  "validation",
  "common",
] as const);

/**
 * Specialized i18n middleware for user operations.
 * Preloads only user-related namespaces.
 */
export const i18nUserMiddleware = i18nWithNamespaces([
  "user",
  "auth",
  "errors",
  "validation",
  "common",
] as const);
