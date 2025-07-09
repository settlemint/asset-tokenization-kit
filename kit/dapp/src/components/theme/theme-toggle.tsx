/**
 * Theme toggle component for switching between light, dark, and system themes.
 *
 * This component provides a user interface for theme selection in the application,
 * supporting light mode, dark mode, and system preference detection. It can be
 * rendered in two different modes:
 * - As a standalone dropdown button
 * - As a menu item within another dropdown
 *
 * The component integrates with next-themes for theme persistence and automatic
 * theme switching based on system preferences.
 *
 * @module components/theme/theme-toggle
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
import { Check, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/**
 * Props for the ThemeMenuItem component.
 */
interface ThemeMenuItemProps {
  /** The theme identifier (e.g., "light", "dark", "system") */
  theme: string;
  /** Callback function to handle theme changes */
  onThemeChange: (theme: string) => void;
}

/**
 * Individual theme option item within the theme selection menu.
 *
 * Displays a theme option with an appropriate icon and label, showing a checkmark
 * for the currently selected theme.
 *
 * @param {ThemeMenuItemProps & { currentTheme?: string }} props - Component props
 * @param {string} props.theme - The theme identifier for this menu item
 * @param {(theme: string) => void} props.onThemeChange - Handler for theme selection
 * @param {string} [props.currentTheme] - The currently active theme
 * @returns {JSX.Element} A dropdown menu item for theme selection
 */
const ThemeMenuItem = ({
  theme,
  onThemeChange,
  currentTheme,
}: ThemeMenuItemProps & { currentTheme?: string }) => {
  const handleClick = useCallback(() => {
    onThemeChange(theme);
  }, [theme, onThemeChange]);
  const { t } = useTranslation("theme");

  /**
   * Returns the appropriate icon component for a given theme.
   * @param {string} themeOption - The theme identifier
   * @returns {JSX.Element} Icon component for the theme
   */
  const getThemeIcon = (themeOption: string) => {
    if (themeOption === "light") return <SunIcon className="size-4" />;
    if (themeOption === "dark") return <MoonIcon className="size-4" />;
    return <div className="size-4" />;
  };

  /**
   * Returns the localized label for a given theme.
   * @param {string} themeOption - The theme identifier
   * @returns {string} Translated theme label
   */
  const getThemeLabel = (themeOption: string) => {
    if (themeOption === "dark") return t("dark");
    if (themeOption === "light") return t("light");
    return t("system");
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        {getThemeIcon(theme)}
        {getThemeLabel(theme)}
      </div>
      {currentTheme === theme && <Check className="ml-2 size-4" />}
    </DropdownMenuItem>
  );
};

/**
 * Props for the ThemeToggle component.
 */
interface ThemeToggleProps {
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
 * ThemeToggle component for switching between application themes.
 *
 * This component provides a user-friendly interface for theme selection with support
 * for light, dark, and system-based themes. It can be rendered in two modes:
 *
 * 1. **Dropdown mode** (default): Renders as a button that opens a dropdown menu
 * 2. **MenuItem mode**: Renders as a submenu item for integration within existing menus
 *
 * The component uses next-themes for theme management and includes:
 * - Automatic theme persistence across sessions
 * - System preference detection and syncing
 * - Smooth transitions between themes
 * - Accessible keyboard navigation
 * - Internationalization support
 *
 * @param {ThemeToggleProps} props - Component configuration options
 * @param {"dropdown" | "menuItem"} [props.mode="dropdown"] - Rendering mode
 * @param {string} [props.variant="outline"] - Button style variant (dropdown mode only)
 * @param {string} [props.size="icon"] - Button size preset (dropdown mode only)
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element | null} Theme toggle component or null during SSR
 *
 * @example
 * // As a standalone dropdown button
 * <ThemeToggle />
 *
 * @example
 * // As a menu item in a navigation dropdown
 * <DropdownMenuContent>
 *   <ThemeToggle mode="menuItem" />
 * </DropdownMenuContent>
 *
 * @example
 * // With custom styling
 * <ThemeToggle
 *   variant="ghost"
 *   size="sm"
 *   className="custom-theme-toggle"
 * />
 */
export function ThemeToggle({
  mode = "dropdown" as "dropdown" | "menuItem",
  variant = "outline",
  size = "icon",
  className,
}: ThemeToggleProps) {
  const mounted = useMounted();
  const { setTheme, theme, resolvedTheme, themes } = useTheme();
  const { t } = useTranslation("theme");

  /**
   * Handles theme change requests by updating the theme through next-themes.
   * @param {string} newTheme - The theme to switch to
   */
  const handleThemeChange = useCallback(
    (newTheme: string) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  // Show skeleton during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const themeMenuItems = themes.map((themeOption) => (
    <ThemeMenuItem
      key={themeOption}
      theme={themeOption}
      onThemeChange={handleThemeChange}
      currentTheme={theme}
    />
  ));

  if (mode === "menuItem") {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="gap-2 [&_svg]:text-muted-foreground">
          <div className="relative size-4">
            <SunIcon className="dark:-rotate-90 absolute size-4 rotate-0 scale-100 transition-all dark:scale-0" />
            <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
          {t("toggle-label")}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>{themeMenuItems}</DropdownMenuSubContent>
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
          aria-label={t("toggle-label")}
        >
          <SunIcon className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {size !== "icon" && <span className="ml-2">{resolvedTheme}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{themeMenuItems}</DropdownMenuContent>
    </DropdownMenu>
  );
}
