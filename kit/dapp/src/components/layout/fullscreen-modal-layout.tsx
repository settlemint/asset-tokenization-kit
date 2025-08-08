import { ModalCardLayout } from "@/components/layout/modal-card-layout";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface FullScreenModalLayoutProps {
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
export function FullScreenModalLayout({
  open,
  onOpenChange,
  children,
  className,
  header,
}: FullScreenModalLayoutProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-none !w-auto !h-auto !p-0 !border-0 !bg-transparent"
        showCloseButton={false}
      >
        <ModalCardLayout className={className} header={header}>
          {children}
        </ModalCardLayout>
      </DialogContent>
    </Dialog>
  );
}
