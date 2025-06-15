import { Translation } from "@/lib/i18n";
import { AuthProvider } from "@/providers/auth";
import { ThemeProvider } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Translation>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </Translation>
  );
}
