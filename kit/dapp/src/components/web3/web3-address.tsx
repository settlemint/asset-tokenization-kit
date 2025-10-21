import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { Badge } from "@/components/ui/badge";
import { Web3Avatar } from "@/components/web3/web3-avatar";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/orpc-client";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useQuery } from "@tanstack/react-query";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { memo, useMemo } from "react";

const COMMON_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 29, // stale data for 29 minutes
  gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
  retry: false, // Don't retry if address is not a user
  throwOnError: false, // Don't throw if address is not a user
  refetchOnMount: false,
};
export interface Web3AddressProps {
  address: EthereumAddress;
  size?: "tiny" | "small" | "medium" | "big" | "large";
  copyToClipboard?: boolean;
  truncate?: boolean;
  className?: string;
  showPrettyName?: boolean;
  linkOptions?: Omit<LinkComponentProps, "className">;
}

function Web3AddressComponent({
  address,
  copyToClipboard = true,
  size = "tiny",
  truncate = true,
  className,
  showPrettyName = true,
  linkOptions,
}: Web3AddressProps) {
  // Query for account data by address
  const { data: accountSearch } = useQuery(
    orpc.account.search.queryOptions({
      input: { query: address, limit: 1 },
      enabled: showPrettyName,
      ...COMMON_QUERY_OPTIONS,
    })
  );
  const account = accountSearch?.[0];

  const displayName = useMemo(() => {
    if (!showPrettyName) {
      return undefined;
    }
    return account?.displayName;
  }, [showPrettyName, account]);

  // Memoize truncated address display
  const truncatedAddressDisplay = useMemo(() => {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }, [address]);

  const displayContent = useMemo(() => {
    const renderAddress = (addressClassName?: string) => {
      const displayValue = truncate ? truncatedAddressDisplay : address;

      return (
        <span className={cn("font-mono", addressClassName)} title={address}>
          {displayValue}
        </span>
      );
    };

    if (displayName) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{displayName}</span>

          <Badge className="min-w-0 max-w-24" variant="outline" title={address}>
            {renderAddress("text-xs")}
          </Badge>
        </div>
      );
    }

    return renderAddress();
  }, [displayName, address, truncate, truncatedAddressDisplay]);

  if (copyToClipboard) {
    const content = (
      <>
        <Web3Avatar
          address={address}
          size={size}
          name={displayName}
          className="mr-2"
        />
        {displayContent}
      </>
    );
    if (linkOptions) {
      return (
        <CopyToClipboard
          value={address}
          className={cn("inline-flex items-center", className)}
        >
          <Link
            className="inline-flex min-w-0 max-w-full items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm transition-colors hover:text-primary"
            {...linkOptions}
          >
            {content}
          </Link>
        </CopyToClipboard>
      );
    }
    return (
      <CopyToClipboard
        value={address}
        className={cn("inline-flex items-center", className)}
      >
        {content}
      </CopyToClipboard>
    );
  }

  const content = (
    <div className={cn("flex items-center", className)}>
      <Web3Avatar
        address={address}
        size={size}
        name={displayName}
        className="mr-2"
      />
      {displayContent}
    </div>
  );

  if (linkOptions) {
    return (
      <Link
        className="inline-flex min-w-0 max-w-full items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm transition-colors hover:text-primary"
        {...linkOptions}
      >
        {content}
      </Link>
    );
  }

  return content;
}

// Memoize the component to prevent unnecessary re-renders
export const Web3Address = memo(Web3AddressComponent);
Web3Address.displayName = "Web3Address";
