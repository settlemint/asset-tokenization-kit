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
  theme: string;
  onThemeChange: (theme: string) => void;
}

/**
 * A single theme menu item component.
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

  const getThemeIcon = (themeOption: string) => {
    if (themeOption === "light") return <SunIcon className="size-4" />;
    if (themeOption === "dark") return <MoonIcon className="size-4" />;
    return <div className="size-4" />;
  };

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
 * A component that allows users to toggle between different theme options.
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
        <DropdownMenuSubTrigger>
          <SunIcon className="dark:-rotate-90 size-4 rotate-0 scale-100 transition-all dark:scale-0" />
          <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
