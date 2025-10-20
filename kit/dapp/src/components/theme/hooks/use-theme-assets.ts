import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-client";
import {
  DEFAULT_THEME,
  type LogoConfig,
  type ThemeConfig,
  type ThemeMetadata,
} from "../lib/schema";

type ThemeAssets = {
  logo: LogoConfig;
  metadata: ThemeMetadata;
};

const DEFAULT_ASSETS: ThemeAssets = {
  logo: DEFAULT_THEME.logo,
  metadata: DEFAULT_THEME.metadata,
};

function selectThemeAssets(theme: ThemeConfig): ThemeAssets {
  return {
    logo: theme.logo,
    metadata: theme.metadata,
  };
}

export function useThemeAssets(): ThemeAssets {
  const { data } = useQuery({
    ...orpc.settings.theme.get.queryOptions({ input: {} }),
    select: selectThemeAssets,
  });

  return data ?? DEFAULT_ASSETS;
}
