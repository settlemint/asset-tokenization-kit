'use client';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { ReactNode } from 'react';

interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function ActionSheet({ open, onOpenChange, children }: ActionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>{children}</SheetContent>
    </Sheet>
  );
}
