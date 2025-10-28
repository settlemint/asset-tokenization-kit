import { useThemeAssets } from "@/components/theme/hooks/use-theme-assets";
import { DEFAULT_THEME } from "@/components/theme/lib/schema";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import type { PropsWithChildren } from "react";

type LogoVariant = "horizontal" | "vertical" | "icon";

const FALLBACK_LOGOS: Record<
  LogoVariant,
  {
    light: string;
    dark: string;
  }
> = {
  horizontal: {
    light: "/logos/settlemint-logo-h-lm.svg",
    dark: "/logos/settlemint-logo-h-dm.svg",
  },
  vertical: {
    light: "/logos/settlemint-logo-v-lm.svg",
    dark: "/logos/settlemint-logo-v-dm.svg",
  },
  icon: {
    light: "/logos/settlemint-logo-i-lm.svg",
    dark: "/logos/settlemint-logo-i-dm.svg",
  },
};

interface LogoProps {
  className?: string;
  imgClassName?: string;
  variant?: LogoVariant;
  forcedColorMode?: "light" | "dark";
}

export function Logo({
  className,
  imgClassName,
  variant = "horizontal",
  forcedColorMode,
}: PropsWithChildren<LogoProps>) {
  const { logo } = useThemeAssets();
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const fallback = FALLBACK_LOGOS[variant];

  const lightUrl = logo.lightUrl?.trim();
  const darkUrl = logo.darkUrl?.trim();
  const logoAlt = logo.alt?.trim();

  const resolveSrc = (
    value: string | undefined,
    fallbackSrc: string
  ): string => {
    const trimmed = value?.trim();
    if (!trimmed) {
      return fallbackSrc;
    }
    return trimmed;
  };

  const lightSrc = resolveSrc(lightUrl, fallback.light);
  const darkSrc = resolveSrc(darkUrl, fallback.dark);
  const alt =
    logoAlt && logoAlt.length > 0
      ? logoAlt
      : (DEFAULT_THEME.logo.alt ?? "SettleMint");
  const width = logo.width && logo.width > 0 ? logo.width : undefined;
  const height = logo.height && logo.height > 0 ? logo.height : undefined;

  const wrapperClass = cn("inline-flex items-center", className);
  const imageClass = cn("h-full w-auto max-h-full max-w-full", imgClassName);
  const imageProps = {
    alt,
    width,
    height,
    loading: "eager" as const,
    decoding: "async" as const,
    className: imageClass,
  };

  if (forcedColorMode === "light" || forcedColorMode === "dark") {
    const src = forcedColorMode === "dark" ? darkSrc : lightSrc;
    return (
      <span className={wrapperClass}>
        <img src={src} {...imageProps} />
      </span>
    );
  }

  const effectiveMode =
    forcedColorMode ?? (mounted ? resolvedTheme : undefined);
  const src = effectiveMode === "dark" ? darkSrc : lightSrc;

  return (
    <span className={wrapperClass}>
      <img src={src} {...imageProps} />
    </span>
  );
}
