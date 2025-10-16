import { createContext, useContext } from "react";
import type { ThemeConfig } from "@/components/theme/schema";

type ThemeContextValue = {
  theme: ThemeConfig;
  hash?: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  theme,
  hash,
}: {
  children: React.ReactNode;
  theme: ThemeConfig;
  hash?: string;
}) {
  return (
    <ThemeContext.Provider value={{ theme, hash }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
