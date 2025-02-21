import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { PropsWithChildren } from 'react';

interface AssetFormButtonProps extends PropsWithChildren {
  buttonLabel: string;
  title: string;
  description: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AssetFormButton({ children, buttonLabel, title, description, open, setOpen }: AssetFormButtonProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="dropdown-menu-item w-full justify-start">
          {buttonLabel}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
