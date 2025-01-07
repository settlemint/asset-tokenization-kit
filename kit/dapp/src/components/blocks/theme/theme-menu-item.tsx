'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeMenuItem() {
  const { setTheme, resolvedTheme, themes } = useTheme();

  const nextTheme = themes?.find((theme) => theme !== resolvedTheme);

  if (!nextTheme) {
    return null;
  }

  return (
    <DropdownMenuItem onSelect={() => setTheme(nextTheme)}>
      {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
      Switch to {nextTheme} mode
    </DropdownMenuItem>
  );
}
