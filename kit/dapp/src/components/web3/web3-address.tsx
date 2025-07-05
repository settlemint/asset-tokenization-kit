import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Web3Avatar } from "@/components/web3/web3-avatar";
import { cn } from "@/lib/utils";
import { type EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { orpc } from "@/orpc";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useMemo } from "react";

interface Web3AddressProps {
  address: EthereumAddress;
  size?: "tiny" | "small" | "medium" | "big" | "large";
  copyToClipboard?: boolean;
  showFullAddress?: boolean;
  className?: string;
  avatarOnly?: boolean;
  showBadge?: boolean;
}

function Web3AddressComponent({
  address,
  copyToClipboard = false,
  size = "tiny",
  showFullAddress = true,
  className,
  avatarOnly = false,
  showBadge = true,
}: Web3AddressProps) {
  const { data: users, isLoading: isLoadingUser } = useQuery(
    orpc.user.list.queryOptions({
      input: {
        searchByAddress: address,
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    })
  );

  const user = users?.[0];

  const { data: tokens, isLoading: isLoadingToken } = useQuery(
    orpc.token.list.queryOptions({
      input: {
        searchByAddress: address,
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    })
  );

  const token = tokens?.[0];
  const isLoading = isLoadingUser || isLoadingToken;

  // Memoize truncated address display
  const truncatedAddressDisplay = useMemo(() => {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }, [address]);

  const renderAddress = useCallback(
    (addressClassName?: string) => {
      const displayValue = showFullAddress ? address : truncatedAddressDisplay;

      return (
        <span className={cn("font-mono", addressClassName)} title={address}>
          {displayValue}
        </span>
      );
    },
    [address, showFullAddress, truncatedAddressDisplay]
  );

  const displayContent = useMemo(() => {
    if (avatarOnly) return null;

    if (isLoading) {
      return <Skeleton className="h-4 w-32" />;
    }

    if (token?.name) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{token.name}</span>
          {token.symbol && (
            <span className="text-muted-foreground text-xs">
              ({token.symbol})
            </span>
          )}
          {showBadge && (
            <Badge
              className="min-w-0 max-w-24"
              variant="secondary"
              title={address}
            >
              {renderAddress("text-xs")}
            </Badge>
          )}
        </div>
      );
    }

    if (user?.name) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{user.name}</span>
          {showBadge && (
            <Badge
              className="min-w-0 max-w-24"
              variant="secondary"
              title={address}
            >
              {renderAddress("text-xs")}
            </Badge>
          )}
        </div>
      );
    }

    return renderAddress();
  }, [avatarOnly, isLoading, token, user, showBadge, renderAddress, address]);

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
          name={user?.name ?? token?.name}
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
        name={user?.name ?? token?.name}
        className="mr-2"
      />
      {displayContent}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const Web3Address = memo(Web3AddressComponent);
Web3Address.displayName = "Web3Address";
