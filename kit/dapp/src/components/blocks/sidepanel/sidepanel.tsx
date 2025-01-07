import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { ReactNode } from 'react';

interface SidePanelProps {
  title: string;
  description: string;
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidePanel({ children, title, description, trigger, open, onOpenChange }: SidePanelProps) {
  return (
    <div className="SidePanel">
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent className="w-[33%] lg:max-w-[33%]">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="-ml-8 -mr-8">{children}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
