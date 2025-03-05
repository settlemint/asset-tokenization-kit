"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyProps {
  value: string;
  /**
   * Optional display text. If not provided, will display the value
   */
  displayText?: string;
  /**
   * Optional success message. Defaults to "Copied to clipboard!"
   */
  successMessage?: string;
  /**
   * Optional className for the container
   */
  className?: string;
}

export function CopyToClipboard({
  value,
  displayText = "",
  successMessage = "Copied to clipboard!",
  className,
}: CopyProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setHasCopied(true);
        toast.success(successMessage);
        // Reset copy icon after 2 seconds
        setTimeout(() => {
          setHasCopied(false);
        }, 2000);
      })
      .catch((error: Error) => {
        console.error("copy to clipboard failed", error);
        toast.error("Failed to copy to clipboard");
      });
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div
        className="flex-1 cursor-pointer overflow-x-auto whitespace-nowrap"
        onClick={handleCopy}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCopy();
          }
        }}
      >
        <span className="text-xs">{displayText ?? value}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-4 hover:bg-theme-accent-background ml-1 cursor-pointer"
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {hasCopied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <CopyIcon className="size-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
