"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguagesIcon } from "@/components/ui/languages";
import { Skeleton } from "@/components/ui/skeleton";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import { Check } from "lucide-react";
import type { Locale } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Language display names mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  ja: "日本語",
  ar: "العربية",
};

/**
 * Props for the LanguageToggle component.
 */
interface LanguageToggleProps {
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
  sm: "size-94",
  lg: "h-11 w-20",
} as const;

/**
 * A component that allows users to switch between different languages.
 * @param props - The component props.
 * @returns A dropdown menu for language selection.
 */
export function LanguageToggle({
  variant = "outline",
  size = "icon",
  className,
}: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = ((params.locale as string) ||
    routing.defaultLocale) as (typeof routing.locales)[number];
  const [mounted, setMounted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  /**
   * Handles setting a new language.
   * @param locale - The new locale to set.
   */
  const handleSetLanguage = useCallback(
    (locale: Locale) => {
      if (locale === currentLocale) return;

      setIsPending(true);
      router.push(pathname, {
        locale: locale as (typeof routing.locales)[number],
        scroll: false,
      });

      // Use setTimeout to simulate the end of navigation
      // since router.push doesn't return a Promise we can chain
      setTimeout(() => {
        setIsPending(false);
      }, 300);
    },
    [currentLocale, pathname, router]
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
          aria-label="Change language"
          disabled={isPending}
        >
          <LanguagesIcon className="h-[1.2rem] w-[1.2rem]" />
          {size !== "icon" && (
            <span className="ml-2">
              {isPending
                ? "Changing..."
                : LANGUAGE_NAMES[currentLocale] || currentLocale}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleSetLanguage(locale)}
            className="flex items-center justify-between"
            disabled={isPending || locale === currentLocale}
          >
            {LANGUAGE_NAMES[locale] || locale}
            {locale === currentLocale && <Check className="ml-2 size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
