import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
 * Props for the LanguageMenuItem component.
 */
interface LanguageMenuItemProps {
  locale: string;
  currentLanguage: string;
  isPending: boolean;
  onLanguageChange: (locale: string) => void;
}

/**
 * A single language menu item component.
 * @param {object} props - The component props.
 * @param {string} props.locale - The locale code for the language.
 * @param {string} props.currentLanguage - The currently selected language code.
 * @param {boolean} props.isPending - Whether a language change is in progress.
 * @param {(locale: string) => void} props.onLanguageChange - Callback function to handle language changes.
 * @returns {JSX.Element} A dropdown menu item for language selection.
 */
const LanguageMenuItem = ({
  locale,
  currentLanguage,
  isPending,
  onLanguageChange,
}: LanguageMenuItemProps) => {
  const handleClick = useCallback(() => {
    onLanguageChange(locale);
  }, [locale, onLanguageChange]);

  return (
    <DropdownMenuItem
      onClick={handleClick}
      className="flex items-center justify-between"
      disabled={isPending || locale === currentLanguage}
    >
      {LANGUAGE_NAMES[locale] ?? locale}
      {locale === currentLanguage && <Check className="ml-2 size-4" />}
    </DropdownMenuItem>
  );
};

/**
 * Props for the LanguageSwitcher component.
 */
interface LanguageSwitcherProps {
  /** The mode of the component - dropdown or menuItem. */
  mode?: "dropdown" | "menuItem";
  /** The variant of the button. */
  variant?: Parameters<typeof Button>[0]["variant"];
  /** The size of the button. */
  size?: Parameters<typeof Button>[0]["size"];
  /** Additional CSS classes to apply to the button. */
  className?: string;
}

/**
 * A component that allows users to switch between different languages.
 * @param {object} [props] - The component props.
 * @param {import("@/components/ui/button").ButtonProps["variant"]} [props.variant] - The variant of the button.
 * @param {import("@/components/ui/button").ButtonProps["size"]} [props.size] - The size of the button.
 * @param {string} [props.className] - Additional CSS classes to apply to the button.
 * @returns {JSX.Element} A dropdown menu for language selection.
 */
export function LanguageSwitcher({
  mode = "dropdown" as "dropdown" | "menuItem",
  variant = "outline",
  size = "icon",
  className,
}: LanguageSwitcherProps = {}) {
  const mounted = useMounted();
  const { i18n, t } = useTranslation("language");
  const [isPending, setIsPending] = useState(false);

  const handleLanguageChange = useCallback(
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

  const languageMenuItems = supportedLanguages.map((locale) => (
    <LanguageMenuItem
      key={locale}
      locale={locale}
      currentLanguage={i18n.language}
      isPending={isPending}
      onLanguageChange={handleLanguageChange}
    />
  ));

  if (mode === "menuItem") {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger disabled={isPending}>
          <Languages />
          {t("switch")}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>{languageMenuItems}</DropdownMenuSubContent>
      </DropdownMenuSub>
    );
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
      <DropdownMenuContent align="end">{languageMenuItems}</DropdownMenuContent>
    </DropdownMenu>
  );
}
