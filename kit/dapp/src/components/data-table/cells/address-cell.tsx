"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface AddressCellProps {
  address: string;
  showCopyButton?: boolean;
  truncateLength?: number;
  className?: string;
  onCopy?: (address: string) => void;
}

/**
 * Reusable cell component for displaying blockchain addresses with copy functionality
 */
export function AddressCell({
  address,
  showCopyButton = true,
  truncateLength = 6,
  className,
  onCopy,
}: AddressCellProps) {
  const { t } = useTranslation("general");

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(address);
    toast.success(t("components.data-table.address-copied"));
    onCopy?.(address);
  }, [address, onCopy, t]);

  const truncatedAddress = `${address.slice(0, truncateLength)}...${address.slice(-truncateLength + 2)}`;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-mono text-xs text-muted-foreground ${className ?? ""}`}
      >
        {truncatedAddress}
      </span>
      {showCopyButton && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCopy}
          aria-label={`Copy address ${address}`}
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
