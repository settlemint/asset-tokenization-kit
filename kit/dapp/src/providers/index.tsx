/**
 * Root Provider Component
 *
 * This module exports the main Providers component that wraps the entire application
 * with essential context providers. It establishes the provider hierarchy to ensure
 * proper access to global application state and functionality.
 *
 * Provider hierarchy (from outermost to innermost):
 * 1. I18nProvider - Internationalization support
 * 2. NextThemesProvider - Theme management (light/dark mode)
 * 3. AuthProvider - Authentication state and functionality
 *
 * This ordering ensures that:
 * - Translation services are available to all components, including theme and auth UI
 * - Theme preferences are persisted and accessible throughout the app
 * - Authentication state is available to all application components
 * @see {@link ./i18n-provider} - Internationalization provider
 * @see {@link ./auth} - Authentication provider
 * @see {@link https://github.com/pacocoursey/next-themes} - Next Themes documentation
 */

import { AuthProvider } from "@/providers/auth";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { I18nProvider } from "./i18n-provider";

/**
 * Root provider component that wraps the application with essential contexts.
 *
 * This component should be used at the root of your application to provide:
 * - Multi-language support with automatic language detection
 * - Theme switching between light, dark, and system preference
 * - Authentication state management and user session handling
 * @example
 * ```tsx
 * // In your root layout or App component
 * import { Providers } from '@/providers';
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <NextThemesProvider
        /**
         * The HTML attribute used to set the theme.
         * "class" adds theme classes to the HTML element (e.g., "dark", "light").
         */
        attribute="class"
        /**
         * Default theme when user hasn't made a selection.
         * "system" respects the user's OS theme preference.
         */
        defaultTheme="system"
        /**
         * Enable system theme detection.
         * Automatically switches between light/dark based on OS settings.
         */
        enableSystem
        /**
         * localStorage key for persisting theme preference.
         * Ensures theme selection persists across sessions.
         */
        storageKey="vite-ui-theme"
      >
        <AuthProvider>{children}</AuthProvider>
      </NextThemesProvider>
    </I18nProvider>
  );
}
