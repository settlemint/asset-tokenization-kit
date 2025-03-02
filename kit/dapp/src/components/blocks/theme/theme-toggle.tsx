"use client";

import { MoonIcon } from "@/components/ui/animated-icons/moon";
import { SunIcon } from "@/components/ui/animated-icons/sun";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

/**
 * Props for the ThemeToggle component.
 */
interface ThemeToggleProps {
  /** The variant of the button. */
  variant?: Parameters<typeof Button>[0]["variant"];
  /** The size of the button. */
  size?: Parameters<typeof Button>[0]["size"];
  /** Additional CSS classes to apply to the button. */
  className?: string;
}

/**
 * Mapping of button sizes to skeleton sizes.
 */
const skeletonSizes = {
  icon: "h-10 w-10",
  default: "h-10 w-16",
  sm: "h-9 w-14",
  lg: "h-11 w-20",
} as const;

/**
 * A component that allows users to toggle between different theme options.
 * @param props - The component props.
 * @returns A dropdown menu for theme selection.
 */
export function ThemeToggle({
  variant = "outline",
  size = "icon",
  className,
}: ThemeToggleProps) {
  const { setTheme, resolvedTheme, themes } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("theme");

  /**
   * Handles setting a new theme.
   * @param newTheme - The new theme to set.
   */
  const handleSetTheme = useCallback(
    (newTheme: string) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    const skeletonSize =
      skeletonSizes[size as keyof typeof skeletonSizes] || skeletonSizes.icon;
    return <Skeleton className={`${skeletonSize} rounded-md ${className}`} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label={t("toggle-label")}
        >
          <SunIcon className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {size !== "icon" && <span className="ml-2">{resolvedTheme}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme}
            onClick={() => handleSetTheme(theme)}
            className="capitalize"
          >
            {t(theme)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
