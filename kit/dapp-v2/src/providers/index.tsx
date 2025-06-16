import { AuthProvider } from "@/providers/auth";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { I18nProvider } from "./i18n-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="vite-ui-theme"
      >
        <AuthProvider>{children}</AuthProvider>
      </NextThemesProvider>
    </I18nProvider>
  );
}
