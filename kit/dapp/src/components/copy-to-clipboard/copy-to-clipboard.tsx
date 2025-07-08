import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, CopyIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface CopyProps {
  /**
   * The value to copy to clipboard
   */
  value: string;
  /**
   * Children to display (clickable content)
   */
  children: React.ReactNode;
  /**
   * Optional className for the container
   */
  className?: string;
  /**
   * Optional callback when copy succeeds
   */
  onCopy?: () => void;
  /**
   * Time in ms before resetting icon. Defaults to 2000ms
   */
  resetDelay?: number;
  /**
   * Whether to show the copy button. Defaults to true
   */
  showButton?: boolean;
}

export function CopyToClipboard({
  value,
  children,
  className,
  onCopy,
  resetDelay = 2000,
  showButton = true,
}: CopyProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { t } = useTranslation("data-table");

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setHasCopied(true);
      toast.success(t("copiedToClipboard"));
      onCopy?.();

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset copy icon after delay
      timeoutRef.current = setTimeout(() => {
        setHasCopied(false);
      }, resetDelay);
    } catch {
      //ignore
    }
  }, [value, onCopy, resetDelay, t]);

  const handleClick = useCallback(() => {
    void handleCopy();
  }, [handleCopy]);

  // Check if clipboard API is available
  if (!("clipboard" in navigator)) {
    return <>{children}</>;
  }

  if (!showButton) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex-1 min-w-0 inline-flex items-center">{children}</div>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 hover:bg-theme-accent-background"
        onClick={handleClick}
        aria-label={t("copyToClipboard")}
        disabled={hasCopied}
      >
        {hasCopied ? (
          <Check
            className="size-4 text-sm-state-success-background"
            aria-hidden="true"
          />
        ) : (
          <CopyIcon
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </Button>
    </div>
  );
}
