/**
 * Language switcher component for internationalization support.
 *
 * This component provides a UI for users to switch between different languages in the application.
 * It supports two modes of operation:
 * - Dropdown mode: Displays as a standalone button with a dropdown menu
 * - MenuItem mode: Displays as a sub-menu item within another dropdown menu
 *
 * The component handles language persistence and prevents hydration mismatches by
 * only rendering after the component has mounted on the client side.
 *
 * @module components/language/language-switcher
 */

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
import { useMounted } from "@/hooks/use-mounted";
import { supportedLanguages } from "@/lib/i18n";
import { Check, Languages } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Mapping of language codes to their display names.
 * Used to show human-readable language names in the UI.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  "en-US": "English",
  "de-DE": "Deutsch",
  "ar-SA": "العربية",
  "ja-JP": "日本語",
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
 * LanguageSwitcher component that provides language selection functionality.
 *
 * This component can be used in two modes:
 * 1. As a standalone dropdown button (default)
 * 2. As a submenu item within another dropdown menu
 *
 * The component automatically detects available languages from the i18n configuration
 * and displays them with their native names. It handles language switching with loading
 * states and prevents hydration mismatches by only rendering after mount.
 *
 * @param {LanguageSwitcherProps} [props] - Component configuration options
 * @param {"dropdown" | "menuItem"} [props.mode="dropdown"] - Display mode of the switcher
 * @param {string} [props.variant="outline"] - Visual style variant for the button
 * @param {string} [props.size="icon"] - Size preset for the button
 * @param {string} [props.className] - Additional CSS classes for styling
 * @returns {JSX.Element | null} The language switcher component or null during SSR
 *
 * @example
 * // As a standalone dropdown button
 * <LanguageSwitcher />
 *
 * @example
 * // As a menu item within another dropdown
 * <DropdownMenuContent>
 *   <LanguageSwitcher mode="menuItem" />
 * </DropdownMenuContent>
 *
 * @example
 * // With custom styling
 * <LanguageSwitcher
 *   variant="ghost"
 *   size="sm"
 *   className="custom-class"
 * />
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
        <DropdownMenuSubTrigger
          disabled={isPending}
          className="gap-2 [&_svg]:text-muted-foreground"
        >
          <Languages className="size-4" />
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
