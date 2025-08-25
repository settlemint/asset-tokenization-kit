import {
  ConfirmationDialog,
  type ConfirmDialogButton,
} from "@/components/confirmation-dialog";
import { DialogCardLayout } from "@/components/layout/dialog-card-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";

interface DialogCloseOptions {
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  closeIcon?: boolean;
  closeConfirmation?:
    | false
    | {
        title: string;
        description: string;
        leftAction: ConfirmDialogButton;
        rightAction: ConfirmDialogButton;
        ariaLabel: string;
      };
}

interface FullScreenDialogLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  closeOptions?: DialogCloseOptions;
  title?: string;
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
  closeOptions = {},
  title = "Dialog",
}: FullScreenDialogLayoutProps) {
  const { closeOnEscape, closeOnOutsideClick, closeIcon, closeConfirmation } =
    closeOptions;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-none !w-screen !h-screen !p-0 !bg-transparent"
        showCloseButton={false}
        onEscapeKeyDown={(e) => {
          if (!closeOnEscape) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (!closeOnOutsideClick) e.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogCardLayout
          className={className}
          header={header}
          topRightOverlay={
            closeIcon || closeConfirmation ? (
              closeConfirmation ? (
                <ConfirmationDialog
                  title={closeConfirmation.title}
                  description={closeConfirmation.description}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={closeConfirmation.ariaLabel}
                    >
                      <XIcon />
                    </Button>
                  }
                  leftAction={closeConfirmation.leftAction}
                  rightAction={closeConfirmation.rightAction}
                />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onOpenChange(false);
                  }}
                >
                  <XIcon />
                </Button>
              )
            ) : undefined
          }
        >
          {children}
        </DialogCardLayout>
      </DialogContent>
    </Dialog>
  );
}
