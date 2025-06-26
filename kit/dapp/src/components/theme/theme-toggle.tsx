import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMounted } from "@/lib/utils/use-mounted";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

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
 * A component that allows users to toggle between different theme options.
 * @param props - The component props.
 * @returns A dropdown menu for theme selection.
 */
export function ThemeToggle({
  variant = "outline",
  size = "icon",
  className,
}: ThemeToggleProps) {
  const mounted = useMounted();
  const { setTheme, resolvedTheme, themes } = useTheme();
  const { t } = useTranslation("theme");


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
            onClick={() => {
              setTheme(theme);
            }}
            className="capitalize"
          >
            {theme === "dark"
              ? t("dark")
              : theme === "light"
                ? t("light")
                : t("system")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
