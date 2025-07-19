import i18n, { fallbackLng } from "@/lib/i18n";
import type { TFunction } from "i18next";
import { baseRouter } from "../../procedures/base.router";

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
    // Get language from context, default to fallback language (English)
    const language = context.language ?? fallbackLng;

    // Ensure required namespaces are loaded
    const namespacesToLoad = ["settings", "exchange-rates", "user"];
    for (const ns of namespacesToLoad) {
      if (!i18n.hasResourceBundle(language, ns)) {
        try {
          await i18n.loadNamespaces(ns);
        } catch {
          // Namespace might not exist, continue
        }
      }
    }

    // Create a new instance of the translation function for this request
    // This ensures thread safety and proper language isolation
    const t: TFunction = i18n.getFixedT(language);

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
