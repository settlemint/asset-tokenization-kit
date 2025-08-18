import { Web3Address } from "@/components/web3/web3-address";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { safeToString } from "./safe-to-string";
import type { FormatValueProps } from "./types";

export function FormatAddress({ value, options }: FormatValueProps) {
  const { showPrettyName = true } = options;

  try {
    const validAddress = getEthereumAddress(value);
    return (
      <Web3Address
        address={validAddress}
        copyToClipboard={true}
        showFullAddress={false}
        size="tiny"
        showSymbol={false}
        showPrettyName={showPrettyName}
      />
    );
  } catch {
    // If address is invalid, show the raw value
    return (
      <span className="text-xs text-muted-foreground font-mono">
        {safeToString(value)}
      </span>
    );
  }
}
