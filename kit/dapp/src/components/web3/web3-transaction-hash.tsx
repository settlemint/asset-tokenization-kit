import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { cn } from "@/lib/utils";
import type { EthereumHash } from "@atk/zod/validators/ethereum-hash";

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
 * - Consistent with other Web3 components
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
 *   showFullHash={false}
 * />
 * ```
 */
export function Web3TransactionHash({
  hash,
  copyToClipboard = false,
  showFullHash = true,
  className,
}: Web3TransactionHashProps) {
  const displayHash = showFullHash
    ? hash
    : `${hash.slice(0, 6)}...${hash.slice(-4)}`;

  const content = (
    <span className={cn("font-mono", className)}>{displayHash}</span>
  );

  if (!copyToClipboard) {
    return content;
  }

  return (
    <CopyToClipboard value={hash} className="inline-flex items-center">
      {content}
    </CopyToClipboard>
  );
}
