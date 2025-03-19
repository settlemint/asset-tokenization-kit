"use client";

import {
  LanguagesIcon,
  type LanguagesIconHandle,
} from "@/components/ui/animated-icons/languages";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import { Check } from "lucide-react";
import { useTranslations, type Locale } from "next-intl";
import { useParams } from "next/navigation";
import { useRef, useTransition } from "react";

// Language display names mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  ja: "日本語",
  ar: "العربية",
};

export function LanguageMenuItem() {
  const router = useRouter();
  const pathname = usePathname();
  const languagesIconRef = useRef<LanguagesIconHandle>(null);
  // Get locale from params which will be updated correctly after navigation
  const params = useParams();
  const currentLocale = ((params.locale as string) ||
    routing.defaultLocale) as (typeof routing.locales)[number];
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("language");

  const handleLanguageChange = (locale: Locale) => {
    // Use React's useTransition to avoid blocking the UI during navigation
    startTransition(() => {
      // Navigate to the same page but with the new locale
      router.push(pathname, {
        locale: locale as (typeof routing.locales)[number],
        scroll: false, // Prevent scroll jumping during navigation
      });
    });
  };

  const handleMouseEnter = () => {
    languagesIconRef.current?.startAnimation();
  };

  const handleMouseLeave = () => {
    languagesIconRef.current?.stopAnimation();
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={isPending}
        className="p-2"
      >
        <LanguagesIcon
          ref={languagesIconRef}
          className="mr-4 size-4 text-muted-foreground"
        />
        <span>{isPending ? t("changing") : t("language")}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-[8rem]">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            className="dropdown-menu-item cursor-pointer justify-between gap-1 px-2 py-1.5 text-sm"
            onSelect={() => handleLanguageChange(locale)}
            disabled={isPending || locale === currentLocale}
          >
            {LANGUAGE_NAMES[locale] || locale.toUpperCase()}
            {locale === currentLocale && (
              <Check className="ml-auto size-4 opacity-100" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
