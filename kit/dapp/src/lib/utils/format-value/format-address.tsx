import { Web3Address } from "@/components/web3/web3-address";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { safeToString } from "./safe-to-string";
import type { FormatValueProps } from "./types";

function hasParams(link: unknown): link is { params: Record<string, unknown> } {
  if (!link || typeof link !== "object") return false;
  const candidate = (link as { params?: unknown }).params;
  return !!candidate && typeof candidate === "object";
}

function hasAddressParam(link: unknown): boolean {
  if (!hasParams(link)) return false;
  return Object.prototype.hasOwnProperty.call(link.params, "address");
}

export function FormatAddress({ value, options }: FormatValueProps) {
  try {
    const validAddress = getEthereumAddress(value);
    const { addressOptions } = options;
    const linkOpts = addressOptions?.linkOptions;
    const needsAddressParam =
      typeof linkOpts?.to === "string" && linkOpts.to.includes("$address");

    const computedAddressOptions =
      linkOpts && needsAddressParam && !hasAddressParam(linkOpts)
        ? {
            ...addressOptions,
            linkOptions: {
              ...linkOpts,
              params: {
                ...(hasParams(linkOpts) ? linkOpts.params : {}),
                address: validAddress,
              },
            },
          }
        : addressOptions;

    return <Web3Address address={validAddress} {...computedAddressOptions} />;
  } catch {
    // If address is invalid, show the raw value
    return (
      <span className="text-xs text-muted-foreground font-mono">
        {safeToString(value)}
      </span>
    );
  }
}
