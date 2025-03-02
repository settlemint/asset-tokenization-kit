import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

interface FormSheetProps extends PropsWithChildren {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  triggerLabel?: string;
  asButton?: boolean;
}

export function FormSheet({
  children,
  open,
  onOpenChange,
  title,
  description,
  triggerLabel,
  asButton,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {triggerLabel &&
        (asButton ? (
          <SheetTrigger asChild>
            <Button variant="secondary">{triggerLabel}</Button>
          </SheetTrigger>
        ) : (
          <SheetTrigger className={cn("w-full text-left")}>
            {triggerLabel}
          </SheetTrigger>
        ))}
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
