import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";

type ConfirmDialogAction = "close" | (() => void) | null;

interface ConfirmationDialogProps {
  title: string;
  description: string;
  trigger?: React.ReactNode;
  leftAction: {
    label: string;
    action: ConfirmDialogAction;
    after?: "close" | null;
  };

  rightAction: {
    label: string;
    action: ConfirmDialogAction;
    after?: "close" | null;
  };
}

export function ConfirmationDialog({
  title,
  description,
  trigger,
  leftAction,

  rightAction,
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
      <div
        onClick={() => {
          setOpen(true);
        }}
      >
        {trigger}
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => {
              handleAction(leftAction.action, leftAction.after);
            }}
          >
            {leftAction.label}
          </Button>
          <Button
            variant="default"
            onClick={() => {
              handleAction(rightAction.action, rightAction.after);
            }}
          >
            {rightAction.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
