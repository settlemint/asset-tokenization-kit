import { DialogCardLayout } from "@/components/layout/dialog-card-layout";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface FullScreenDialogLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  header?: ReactNode;
}

/**
 * Full-screen modal that uses ModalCardLayout for consistent sizing.
 * Dialog handles portal/overlay, ModalCardLayout handles the card appearance.
 */
export function FullScreenDialogLayout({
  open,
  onOpenChange,
  children,
  className,
  header,
}: FullScreenDialogLayoutProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-none !w-auto !h-auto !p-0 !border-0 !bg-transparent"
        showCloseButton={false}
      >
        <DialogCardLayout className={className} header={header}>
          {children}
        </DialogCardLayout>
      </DialogContent>
    </Dialog>
  );
}
