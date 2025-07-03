"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

/**
 * Props for the AddressCell component
 * @interface AddressCellProps
 */
interface AddressCellProps {
  /** The blockchain address to display */
  address: string;
  /** Whether to show the copy button (default: true) */
  showCopyButton?: boolean;
  /** Number of characters to show at start and end of address (default: 6) */
  truncateLength?: number;
  /** Additional CSS classes to apply to the address text */
  className?: string;
  /** Callback function triggered after copying the address */
  onCopy?: (address: string) => void;
}

/**
 * Reusable cell component for displaying blockchain addresses with copy functionality.
 * Automatically truncates long addresses for better display while maintaining full copy capability.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AddressCell address="0x1234567890123456789012345678901234567890" />
 *
 * // With custom truncation and copy callback
 * <AddressCell
 *   address="0x1234567890123456789012345678901234567890"
 *   truncateLength={8}
 *   onCopy={(addr) => console.log(`Copied: ${addr}`)}
 * />
 *
 * // Without copy button
 * <AddressCell
 *   address="0x1234567890123456789012345678901234567890"
 *   showCopyButton={false}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A formatted address display with optional copy functionality
 */
export function AddressCell({
  address,
  showCopyButton = true,
  truncateLength = 6,
  className,
  onCopy,
}: AddressCellProps) {
  const { t } = useTranslation("general");

  /**
   * Handles copying the address to clipboard and showing success toast
   */
  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      void navigator.clipboard.writeText(address);
      toast.success(t("components.data-table.address-copied"));
      onCopy?.(address);
    },
    [address, onCopy, t]
  );

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
