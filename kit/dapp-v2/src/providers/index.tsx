import { AuthProvider } from "@/providers/auth";
import { ThemeProvider } from "./theme";
import { I18nProvider } from "./i18n-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
