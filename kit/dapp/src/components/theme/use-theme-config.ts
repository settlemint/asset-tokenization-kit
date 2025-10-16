import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-client";
import { DEFAULT_THEME, type ThemeConfig } from "./schema";

export function useThemeConfig(): ThemeConfig {
  const query = useQuery(orpc.settings.theme.get.queryOptions({ input: {} }));

  return query.data ?? DEFAULT_THEME;
}
