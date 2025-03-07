"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import LogoHorizontalDark from "./logos/settlemint-logo-h-dm.svg";
import LogoHorizontalLight from "./logos/settlemint-logo-h-lm.svg";
import LogoIconDark from "./logos/settlemint-logo-i-dm.svg";
import LogoIconLight from "./logos/settlemint-logo-i-lm.svg";
import LogoVerticalDark from "./logos/settlemint-logo-v-dm.svg";
import LogoVerticalLight from "./logos/settlemint-logo-v-lm.svg";

interface LogoProps {
  className?: string;
  variant?: "horizontal" | "vertical" | "icon";
  forcedColorMode?: "light" | "dark";
}

export function Logo({
  className = "",
  variant = "horizontal",
  forcedColorMode,
}: PropsWithChildren<LogoProps>) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("components.logo");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className={cn("rounded-md", className)} />;
  }

  const getLogoSrc = () => {
    const isDark = resolvedTheme === "dark";
    switch (variant) {
      case "horizontal":
        return isDark || forcedColorMode === "dark"
          ? LogoHorizontalDark
          : LogoHorizontalLight;
      case "vertical":
        return isDark || forcedColorMode === "dark"
          ? LogoVerticalDark
          : LogoVerticalLight;
      case "icon":
        return isDark || forcedColorMode === "dark"
          ? LogoIconDark
          : LogoIconLight;
      default:
        return LogoHorizontalLight;
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Image
        src={getLogoSrc()}
        alt={t("alt-text")}
        className="h-full w-full"
        priority
      />
    </div>
  );
}
