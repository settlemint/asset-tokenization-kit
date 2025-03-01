import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface FormSheetProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  triggerLabel?: string;
}

export function FormSheet({
  children,
  open,
  onOpenChange,
  title,
  description,
  triggerLabel,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {triggerLabel && (
        <SheetTrigger className="dropdown-menu-item w-full text-left">
          {triggerLabel}
        </SheetTrigger>
      )}
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
