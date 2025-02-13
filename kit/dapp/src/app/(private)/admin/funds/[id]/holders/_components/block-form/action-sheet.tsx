'use client';

import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import type { ReactNode } from 'react';

interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function BlockHolderActionSheet({ open, onOpenChange, children }: ActionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="min-w-[34rem]">
        <SheetTitle className="sr-only">Block Holder</SheetTitle>
        <SheetDescription className="sr-only">Block this holder from performing any transactions.</SheetDescription>
        {children}
      </SheetContent>
    </Sheet>
  );
}
