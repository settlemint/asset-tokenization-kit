import { Web3Address } from "@/components/web3/web3-address";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { safeToString } from "./safe-to-string";
import type { FormatValueProps } from "./types";

export function FormatAddress({ value }: FormatValueProps) {
  try {
    const validAddress = getEthereumAddress(value);
    return (
      <Web3Address address={validAddress} size="tiny" showSymbol={false} />
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
