import { AuthProvider } from "@/providers/auth";
import { ThemeProvider } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
