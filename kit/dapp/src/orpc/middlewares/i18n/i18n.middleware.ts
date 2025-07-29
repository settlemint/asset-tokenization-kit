import i18n, { fallbackLng } from "@/lib/i18n";
import { createLogger } from "@settlemint/sdk-utils/logging";
import type { TOptions } from "i18next";
import { baseRouter } from "../../procedures/base.router";

const logger = createLogger();

/**
 * Context type provided by the i18n middleware
 */
export interface i18nContext {
  language: string;
  t: (key: string, options?: TOptions) => string;
}

/**
 * Common namespaces used by ORPC routes
 * These are the namespaces that are frequently used across mutations
 */
const COMMON_ORPC_NAMESPACES = [
  "tokens", // Token operations
  "system", // System operations
  "errors", // Error messages
  "common", // Common terms
  "validation", // Validation messages
] as const;

/**
 * Internationalization (i18n) middleware for ORPC.
 *
 * This middleware provides server-side translation capabilities for ORPC procedures,
 * enabling automatic language detection and translation based on the user's language
 * preference passed through the context. It integrates seamlessly with the existing
 * i18next setup used throughout the application.
 *
 * The middleware:
 * - Detects the user's language from context.language (passed by ORPC client)
 * - Falls back to English if no language is specified (for direct API usage)
 * - Provides a translation function (t) in the context for all procedures
 * - Uses the same translation files as the rest of the application
 * - Ensures consistent multilingual support across frontend and backend
 *
 * Language detection priority:
 * 1. Explicit language from context (set by ORPC client based on user preference)
 * 2. Fallback to English for direct API calls without language context
 *
 * Benefits:
 * - Unified translation management across the entire application
 * - No need to pass translation messages from frontend to backend
 * - Direct API users get English messages by default
 * - Supports all configured languages (English, German, Arabic, Japanese)
 * - Type-safe translations with existing TypeScript augmentation
 *
 * @example
 * ```typescript
 * // In a procedure handler
 * export const createAsset = pr
 *   .input(createAssetSchema)
 *   .mutation(async ({ input, context }) => {
 *     const { t } = context;
 *
 *     try {
 *       // Use translations in the procedure
 *       await trackTransaction({
 *         message: t('assets:messages.creating'),
 *         // ...
 *       });
 *
 *       return {
 *         success: true,
 *         message: t('assets:messages.created')
 *       };
 *     } catch (error) {
 *       throw new Error(t('errors:asset.creationFailed'));
 *     }
 *   });
 * ```
 *
 * @example
 * ```typescript
 * // The ORPC client automatically passes the user's language
 * // In orpc-client.ts:
 * // context: { language: currentUserLanguage }
 * ```
 *
 * @see {@link @/lib/i18n} - Main i18n configuration
 * @see {@link @/orpc/orpc-client} - ORPC client configuration
 */
export const i18nMiddleware = baseRouter.middleware(
  async ({ context, next }) => {
    // Get language from Accept-Language header, default to fallback language (English)
    const acceptLanguage = context.headers["accept-language"];
    const language =
      acceptLanguage?.split(",")[0]?.split("-")[0] ?? fallbackLng;

    // Preload common ORPC namespaces for this language
    // This ensures they're loaded before the handler runs, preventing blocking
    await Promise.all(
      COMMON_ORPC_NAMESPACES.map(async (ns) =>
        i18n.loadNamespaces(ns).catch(() => {
          // Silently ignore errors - the namespace might not exist for all languages
        })
      )
    );

    // Ensure the language is loaded
    await i18n.loadLanguages(language).catch(() => {
      // Fall back to default language if loading fails
    });

    // Create a new instance of the translation function for this request
    // This ensures thread safety and proper language isolation
    // Create a permissive translation function that accepts any key
    const t = (key: string, options?: TOptions): string => {
      // Create a wrapper that accepts any string key but maintains type safety for options
      const translate = i18n.getFixedT(language) as (
        key: string,
        options?: TOptions
      ) => unknown;
      const result = translate(key, options);
      const translated = typeof result === "string" ? result : String(result);
      if (translated === key) {
        logger.warn(`Translation for key ${key} not found`);
      }
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
      },
    });
  }
);
