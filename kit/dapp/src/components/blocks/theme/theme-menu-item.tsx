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
    <DropdownMenuItem onSelect={() => setTheme(nextTheme)} className="dropdown-menu-item">
      {resolvedTheme === 'dark' ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
      Switch to {nextTheme} mode
    </DropdownMenuItem>
  );
}
