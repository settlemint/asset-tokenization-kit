import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

type ConfirmDialogAction = "close" | (() => void) | null;

interface ConfirmationDialogProps {
  title: string;
  description: string;
  triggerLabel: string;
  leftAction: {
    label: string;
    action: ConfirmDialogAction;
  };
  afterLeftAction?: "close" | null;
  rightAction: {
    label: string;
    action: ConfirmDialogAction;
  };
  afterRightAction?: "close" | null;
}

export function ConfirmationDialog({
  title,
  description,
  triggerLabel,
  leftAction,
  afterLeftAction,
  rightAction,
  afterRightAction,
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);

  const handleAction = (
    action: ConfirmDialogAction,
    afterAction?: "close" | null
  ) => {
    if (action === "close") {
      setOpen(false);
    } else if (typeof action === "function") {
      action();
    }

    if (afterAction === "close") {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true);
        }}
      >
        {triggerLabel}
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => {
              handleAction(leftAction.action, afterLeftAction);
            }}
          >
            {leftAction.label}
          </Button>
          <Button
            variant="default"
            onClick={() => {
              handleAction(rightAction.action, afterRightAction);
            }}
          >
            {rightAction.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
