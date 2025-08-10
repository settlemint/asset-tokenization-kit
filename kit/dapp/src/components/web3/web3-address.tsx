import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { Badge } from "@/components/ui/badge";
import { Web3Avatar } from "@/components/web3/web3-avatar";
import { cn } from "@/lib/utils";
import { type EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { memo, useMemo } from "react";

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
      staleTime: 1000 * 60 * 30, // Cache user data for 30 minutes
      retry: false, // Don't retry if address is not a user
      throwOnError: false, // Don't throw if address is not a user
      enabled: !skipDataQueries, // Disable during onboarding
    })
  );
  const user = userSearch?.[0];

  // Query for token data by address
  const { data: tokenSearch } = useQuery(
    orpc.token.search.queryOptions({
      input: { query: address, limit: 1 },
      staleTime: 1000 * 60 * 30, // Cache token data for 30 minutes
      retry: false, // Don't retry if address is not a token
      throwOnError: false, // Don't throw if address is not a token
      enabled: !skipDataQueries, // Disable during onboarding
    })
  );
  const token = tokenSearch?.[0];

  // Query for account data by address (for contract name fallback)
  const { data: accountSearch } = useQuery(
    orpc.account.search.queryOptions({
      input: { query: address, limit: 1 },
      staleTime: 1000 * 60 * 30, // Cache account data for 30 minutes
      retry: false, // Don't retry if address is not indexed
      throwOnError: false, // Don't throw if account is not found
      enabled: !skipDataQueries, // Disable during onboarding
    })
  );
  const account = accountSearch?.[0];

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

    if (showPrettyName && token?.name) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{token.name}</span>
          {showSymbol && token.symbol && (
            <span className="text-muted-foreground text-xs">
              ({token.symbol})
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

    if (showPrettyName && user?.name) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{user.name}</span>
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

    if (showPrettyName && account?.contractName) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{account.contractName}</span>
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
    token,
    user,
    account,
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
          email={user?.email}
          name={user?.name ?? token?.name ?? account?.contractName}
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
        email={user?.email}
        name={user?.name ?? token?.name ?? account?.contractName}
        className="mr-2"
      />
      {displayContent}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const Web3Address = memo(Web3AddressComponent);
Web3Address.displayName = "Web3Address";
