"use client";

import {
  MoonIcon,
  type MoonIconHandle,
} from "@/components/ui/animated-icons/moon";
import {
  SunIcon,
  type SunIconHandle,
} from "@/components/ui/animated-icons/sun";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRef } from "react";

export function ThemeMenuItem() {
  const { setTheme, resolvedTheme, themes } = useTheme();
  const t = useTranslations("theme");
  const sunIconRef = useRef<SunIconHandle>(null);
  const moonIconRef = useRef<MoonIconHandle>(null);

  const nextTheme = themes?.find((theme) => theme !== resolvedTheme);

  if (!nextTheme) {
    return null;
  }

  const handleMouseEnter = () => {
    if (resolvedTheme === "dark") {
      sunIconRef.current?.startAnimation();
    } else {
      moonIconRef.current?.startAnimation();
    }
  };

  const handleMouseLeave = () => {
    if (resolvedTheme === "dark") {
      sunIconRef.current?.stopAnimation();
    } else {
      moonIconRef.current?.stopAnimation();
    }
  };

  return (
    <DropdownMenuItem
      onSelect={() => setTheme(nextTheme)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {resolvedTheme === "dark" ? (
        <SunIcon ref={sunIconRef} className="mr-2 size-4" />
      ) : (
        <MoonIcon ref={moonIconRef} className="mr-2 size-4" />
      )}
      {t("switch-to-mode", {
        mode: t(nextTheme as "dark" | "light" | "system"),
      })}
    </DropdownMenuItem>
  );
}
