"use client";
"use no memo"; // fixes rerendering with react compiler

import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/routing";
import { getBlockExplorerAddressUrl } from "@/lib/block-explorer";
import { getAssetSearch } from "@/lib/queries/asset/asset-search";
import { getUserSearch } from "@/lib/queries/user/user-search";
import { shortHex } from "@/lib/utils/hex";
import type { FC, PropsWithChildren } from "react";
import useSWR from "swr";
import type { Address } from "viem";
import { getAddress } from "viem";
import { CopyToClipboard } from "../copy/copy";

interface EvmAddressProps extends PropsWithChildren {
  /** The EVM address to display. */
  address: Address;
  name?: string;
  symbol?: string;
  /** The URL of the blockchain explorer (optional). */
  explorerUrl?: string;
  prefixLength?: number;
  suffixLength?: number;
  iconSize?: "tiny" | "small" | "big";
  prettyNames?: boolean;
  verbose?: boolean;
  hoverCard?: boolean;
  copyToClipboard?: boolean;
}

/**
 * Renders an EVM address with a hover card displaying additional information.
 * @param props - The component props.
 * @returns The rendered EvmAddress component.
 */
export function EvmAddress({
  address,
  name,
  symbol,
  explorerUrl,
  children,
  prefixLength = 6,
  suffixLength = 4,
  iconSize = "tiny",
  prettyNames = true,
  verbose = false,
  hoverCard = true,
  copyToClipboard = false,
}: EvmAddressProps) {
  // Fetch user data with SWR
  const { data: user, isLoading: isLoadingUser } = useSWR(
    [`user-search`, address],
    async () => {
      const userResult = await getUserSearch({
        searchTerm: getAddress(address),
      });
      return userResult.length > 0 ? userResult[0] : null;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
  );

  // Fetch asset data with SWR
  const { data: asset, isLoading: isLoadingAsset } = useSWR(
    [`asset-search`, address],
    async () => {
      const assetResult = await getAssetSearch({
        searchTerm: getAddress(address),
      });
      return assetResult.length > 0 ? assetResult[0] : null;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
  );

  const isLoading = isLoadingUser || isLoadingAsset;
  const displayName = prettyNames
    ? (name ?? asset?.name ?? user?.name)
    : undefined;
  const displayEmail = prettyNames ? user?.email : undefined;
  const explorerLink = getBlockExplorerAddressUrl(
    getAddress(address),
    explorerUrl
  );

  const LoadingView: FC = () => {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-6 rounded-full bg-muted/50" />
        <Skeleton className="h-4 w-28 bg-muted/50" />
      </div>
    );
  };

  const MainView: FC = () => {
    if (isLoading) {
      return <LoadingView />;
    }

    return (
      <div className="flex items-center space-x-2">
        <AddressAvatar
          address={getAddress(address)}
          size={iconSize}
          email={displayEmail}
        />
        {!displayName && (
          <span className="font-mono">
            {shortHex(getAddress(address), { prefixLength, suffixLength })}
          </span>
        )}
        {displayName && (
          <span>
            {displayName}{" "}
            {symbol && (
              <span className="text-muted-foreground text-xs">({symbol}) </span>
            )}
            {verbose && (
              <Badge className="font-mono">
                {shortHex(getAddress(address), { prefixLength, suffixLength })}
              </Badge>
            )}
          </span>
        )}
        {copyToClipboard && <CopyToClipboard value={getAddress(address)} />}
      </div>
    );
  };

  if (!hoverCard) {
    return <MainView />;
  }

  return (
    <HoverCard>
      <HoverCardTrigger>
        <MainView />
      </HoverCardTrigger>
      <HoverCardContent className="w-120">
        {isLoading ? (
          <div className="flex items-start">
            <div className="grid grid-cols-[auto_1fr] items-start gap-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start">
            <h4 className="grid grid-cols-[auto_1fr] items-start gap-x-2 font-semibold text-sm">
              <AddressAvatar
                address={getAddress(address)}
                size="big"
                email={displayEmail}
                className="row-span-2"
              />
              <div className="flex flex-col">
                <span className="font-mono">{getAddress(address)}</span>
                {displayName && (
                  <span className="text-sm">
                    {displayName}{" "}
                    {symbol && (
                      <span className="text-muted-foreground text-xs">
                        ({symbol})
                      </span>
                    )}
                  </span>
                )}
                {explorerLink && (
                  <Link
                    prefetch={false}
                    href={explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-primary text-xs hover:underline"
                  >
                    View on the explorer
                  </Link>
                )}
              </div>
            </h4>
          </div>
        )}
        <div className="mt-4">{children}</div>
      </HoverCardContent>
    </HoverCard>
  );
}
