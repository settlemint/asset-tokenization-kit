"use client";

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { MoonIcon, SunIcon, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";

type ThemeType = "system" | "light" | "dark";

interface ThemeOption {
  value: ThemeType;
  label: string;
}

function ThemeIcon({ theme }: { theme: ThemeType | null }) {
  switch (theme) {
    case "light":
      return <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-500" />;
    case "dark":
      return <MoonIcon className="h-[1.2rem] w-[1.2rem] text-gray-300" />;
    default:
      return <SunMoon className="h-[1.2rem] w-[1.2rem] text-gray-500" />;
  }
}

export function ProfileTheme() {
  const { setTheme, resolvedTheme } = useTheme();

  const themeOptions: ThemeOption[] = useMemo(
    () => [
      { value: "system", label: "System" },
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ],
    [],
  );

  const handleSetTheme = useCallback(
    (newTheme: ThemeType) => {
      setTheme(newTheme);
    },
    [setTheme],
  );

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <SunMoon className="mr-2 h-4 w-4" />
        <span>Theme</span>
        <span className="ml-3" aria-hidden="true">
          <ThemeIcon theme={resolvedTheme as ThemeType | null} />
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {themeOptions.map(({ value, label }) => (
            <DropdownMenuItem key={value} onClick={() => handleSetTheme(value)}>
              <ThemeIcon theme={value} />
              <span className="ml-3">{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
