"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import type { PropsWithChildren } from "react";

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
  const { t } = useTranslation();

  const getLogoSrc = () => {
    const isDark = resolvedTheme === "dark";
    switch (variant) {
      case "horizontal":
        return isDark || forcedColorMode === "dark"
          ? "/logos/settlemint-logo-h-dm.svg"
          : "/logos/settlemint-logo-h-lm.svg";
      case "vertical":
        return isDark || forcedColorMode === "dark"
          ? "/logos/settlemint-logo-v-dm.svg"
          : "/logos/settlemint-logo-v-lm.svg";
      case "icon":
        return isDark || forcedColorMode === "dark"
          ? "/logos/settlemint-logo-i-dm.svg"
          : "/logos/settlemint-logo-i-lm.svg";
      default:
        return "/logos/settlemint-logo-h-lm.svg";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <img
        src={getLogoSrc()}
        alt={t("general.appName")}
        className="h-full w-full"
      />
    </div>
  );
}
