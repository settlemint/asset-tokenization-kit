import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supportedLanguages } from "@/lib/i18n";
import { useMounted } from "@/lib/utils/use-mounted";
import { Check, Languages } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

// Language display names mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  ar: "العربية",
  ja: "日本語",
};

/**
 * Props for the LanguageSwitcher component.
 */
interface LanguageSwitcherProps {
  /** The variant of the button. */
  variant?: Parameters<typeof Button>[0]["variant"];
  /** The size of the button. */
  size?: Parameters<typeof Button>[0]["size"];
  /** Additional CSS classes to apply to the button. */
  className?: string;
}

/**
 * A component that allows users to switch between different languages.
 * @param props - The component props.
 * @returns A dropdown menu for language selection.
 */
export function LanguageSwitcher({
  variant = "outline",
  size = "icon",
  className,
}: LanguageSwitcherProps = {}) {
  const mounted = useMounted();
  const { i18n, t } = useTranslation("language");
  const [isPending, setIsPending] = useState(false);

  /**
   * Handles setting a new language.
   * @param locale - The new locale to set.
   */
  const handleSetLanguage = useCallback(
    (locale: string) => {
      if (locale === i18n.language) return;

      setIsPending(true);
      void i18n.changeLanguage(locale).then(() => {
        setIsPending(false);
      });
    },
    [i18n]
  );

  // Show skeleton during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label={t("switch")}
          disabled={isPending}
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          {size !== "icon" && (
            <span className="ml-2">
              {isPending
                ? t("changing")
                : (LANGUAGE_NAMES[i18n.language] ?? i18n.language)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => {
              handleSetLanguage(locale);
            }}
            className="flex items-center justify-between"
            disabled={isPending || locale === i18n.language}
          >
            {LANGUAGE_NAMES[locale] ?? locale}
            {locale === i18n.language && <Check className="ml-2 size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
