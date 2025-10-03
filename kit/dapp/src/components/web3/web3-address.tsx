import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { Badge } from "@/components/ui/badge";
import { Web3Avatar } from "@/components/web3/web3-avatar";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/orpc-client";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useQuery } from "@tanstack/react-query";
import { memo, useMemo } from "react";

const COMMON_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 29, // stale data for 29 minutes
  gcTime: 1000 * 60 * 30, // Cache data for 30 minutes
  retry: false, // Don't retry if address is not a user
  throwOnError: false, // Don't throw if address is not a user
  refetchOnMount: false,
};
interface Web3AddressProps {
  address: EthereumAddress;
  size?: "tiny" | "small" | "medium" | "big" | "large";
  copyToClipboard?: boolean;
  showFullAddress?: boolean;
  className?: string;
  avatarOnly?: boolean;
  showBadge?: boolean;
  showSymbol?: boolean;
  showPrettyName?: boolean;
  skipDataQueries?: boolean; // Skip user/token queries during onboarding
}

function Web3AddressComponent({
  address,
  copyToClipboard = false,
  size = "tiny",
  showFullAddress = true,
  className,
  avatarOnly = false,
  showBadge = false,
  showSymbol = true,
  showPrettyName = true,
  skipDataQueries = false,
}: Web3AddressProps) {
  // Query for user data by wallet address
  const { data: userSearch } = useQuery(
    orpc.user.search.queryOptions({
      input: { query: address, limit: 1 },
      enabled: !skipDataQueries, // Disable during onboarding
      ...COMMON_QUERY_OPTIONS,
    })
  );
  const user = userSearch?.[0];

  // Query for token data by address
  const { data: tokenSearch } = useQuery(
    orpc.token.search.queryOptions({
      input: { query: address, limit: 1 },
      enabled: !skipDataQueries, // Disable during onboarding
      ...COMMON_QUERY_OPTIONS,
    })
  );
  const token = tokenSearch?.[0];

  // Query for account data by address (for contract name fallback)
  const { data: accountSearch } = useQuery(
    orpc.account.search.queryOptions({
      input: { query: address, limit: 1 },
      enabled: !skipDataQueries, // Disable during onboarding
      ...COMMON_QUERY_OPTIONS,
    })
  );
  const account = accountSearch?.[0];

  const data = useMemo(() => {
    if (token) {
      return {
        name: token.name,
        symbol: token.symbol,
      };
    }
    if (user) {
      return {
        name: user.name,
        symbol: undefined,
      };
    }
    return {
      name: account?.contractName,
      symbol: undefined,
    };
  }, [user, token, account]);

  // Memoize truncated address display
  const truncatedAddressDisplay = useMemo(() => {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }, [address]);

  const displayContent = useMemo(() => {
    const renderAddress = (addressClassName?: string) => {
      const displayValue = showFullAddress ? address : truncatedAddressDisplay;

      return (
        <span className={cn("font-mono", addressClassName)} title={address}>
          {displayValue}
        </span>
      );
    };

    if (avatarOnly) return null;

    if (showPrettyName && data?.name) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{data.name}</span>
          {showSymbol && data.symbol && (
            <span className="text-muted-foreground text-xs">
              ({data.symbol})
            </span>
          )}
          {showBadge && (
            <Badge
              className="min-w-0 max-w-24"
              variant="outline"
              title={address}
            >
              {renderAddress("text-xs")}
            </Badge>
          )}
        </div>
      );
    }

    return renderAddress();
  }, [
    avatarOnly,
    data,
    showBadge,
    address,
    showSymbol,
    showPrettyName,
    showFullAddress,
    truncatedAddressDisplay,
  ]);

  if (copyToClipboard && !avatarOnly) {
    return (
      <CopyToClipboard
        value={address}
        className={cn("inline-flex items-center", className)}
      >
        <Web3Avatar
          address={address}
          size={size}
          name={data?.name}
          className="mr-2"
        />
        {displayContent}
      </CopyToClipboard>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Web3Avatar
        address={address}
        size={size}
        name={data?.name}
        className="mr-2"
      />
      {displayContent}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const Web3Address = memo(Web3AddressComponent);
Web3Address.displayName = "Web3Address";
