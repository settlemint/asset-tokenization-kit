import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { EthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

interface Web3TransactionHashProps {
  /**
   * The transaction hash to display
   */
  hash: EthereumHash;
  /**
   * Whether to show the copy to clipboard button
   * @default false
   */
  copyToClipboard?: boolean;
  /**
   * Whether to show the full hash or truncated version
   * @default true
   */
  showFullHash?: boolean;
  /**
   * Additional CSS classes to apply
   */
  className?: string;
}

/**
 * Web3TransactionHash component displays an Ethereum transaction hash
 * with optional copy-to-clipboard functionality.
 *
 * Features:
 * - Truncated hash display by default (0x1234...5678)
 * - Optional full hash display
 * - Copy to clipboard with visual feedback
 * - Multiple size variants
 * - Accessible with tooltips
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Web3TransactionHash hash="0x1234567890abcdef..." />
 *
 * // With copy functionality
 * <Web3TransactionHash
 *   hash="0x1234567890abcdef..."
 *   copyToClipboard
 *   size="small"
 * />
 * ```
 */
export function Web3TransactionHash({
  hash,
  copyToClipboard = false,
  showFullHash = true,
  className,
}: Web3TransactionHashProps) {
  const { t } = useTranslation("common");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard API failed silently
    }
  }, [hash]);

  const displayHash = showFullHash
    ? hash
    : `${hash.slice(0, 6)}...${hash.slice(-4)}`;

  const content = <span className={cn(className)}>{displayHash}</span>;

  if (!copyToClipboard) {
    return content;
  }

  return (
    <div className="inline-flex items-center gap-1">
      {content}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-6 w-6 hover:bg-theme-accent-background")}
              onClick={handleCopy}
              disabled={copied}
              type="button"
            >
              {copied ? (
                <Check className="h-3 w-3 text-sm-state-success-background" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="sr-only">
                {t("transactionHash.copyToClipboard")}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {copied
                ? t("transactionHash.copied")
                : t("transactionHash.copyToClipboard")}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
