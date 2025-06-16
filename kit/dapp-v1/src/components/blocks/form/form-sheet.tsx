import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { PropsWithChildren, ReactNode } from "react";

interface FormSheetProps extends PropsWithChildren {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | ReactNode;
  description: string;
  triggerLabel?: string;
  asButton?: boolean;
  disabled?: boolean;
}

export function FormSheet({
  children,
  open,
  onOpenChange,
  title,
  description,
  triggerLabel,
  asButton,
  disabled = false,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {triggerLabel && asButton && (
        <SheetTrigger asChild>
          <Button
            variant="secondary"
            disabled={disabled}
            className="bg-accent text-primary-foreground shadow-dropdown shadow-inset hover:bg-accent-hover hover:text-primary-foreground"
          >
            {triggerLabel}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="h-full overflow-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
