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

type ConfirmModalAction = "close" | (() => void) | null;

interface ConfirmationModalProps {
  title: string;
  description: string;
  triggerLabel: string;
  leftAction: {
    label: string;
    action: ConfirmModalAction;
  };
  afterLeftAction?: "close" | null;
  rightAction: {
    label: string;
    action: ConfirmModalAction;
  };
  afterRightAction?: "close" | null;
}

export function ConfirmationModal({
  title,
  description,
  triggerLabel,
  leftAction,
  afterLeftAction,
  rightAction,
  afterRightAction,
}: ConfirmationModalProps) {
  const [open, setOpen] = useState(false);

  const handleAction = (
    action: ConfirmModalAction,
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
