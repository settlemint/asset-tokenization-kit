"use client";
"use no memo"; // fixes rerendering with react compiler

import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "@/i18n/routing";
import { getBlockExplorerAddressUrl } from "@/lib/block-explorer";
import { getAssetSearch } from "@/lib/queries/asset/asset-search";
import type { AssetUsers } from "@/lib/queries/asset/asset-users-fragment";
import type { User } from "@/lib/queries/user/user-schema";
import { getUserSearch } from "@/lib/queries/user/user-search";
import { shortHex } from "@/lib/utils/hex";
import {
  type FC,
  type PropsWithChildren,
  cache,
  useEffect,
  useState,
} from "react";
import type { Address } from "viem";
import { getAddress } from "viem";
import { CopyToClipboard } from "../copy/copy";

// Cache the user search function
const cachedUserSearch = cache(async (address: Address) => {
  const userResult = await getUserSearch({
    searchTerm: getAddress(address),
  });
  return userResult.length > 0 ? userResult[0] : null;
});

// Cache the asset search function
const cachedAssetSearch = cache(async (address: Address) => {
  const assetResult = await getAssetSearch({
    searchTerm: getAddress(address),
  });
  return assetResult.length > 0 ? assetResult[0] : null;
});

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
  // State for user and asset data
  const [user, setUser] = useState<User | null>(null);
  const [asset, setAsset] = useState<AssetUsers | null>(null);

  // Effect to fetch user and asset data
  useEffect(() => {
    async function fetchData() {
      const userResult = await cachedUserSearch(getAddress(address));
      setUser(userResult);
    }

    // Call the fetch function
    void fetchData();
  }, [address]);

  useEffect(() => {
    async function fetchData() {
      const assetResult = await cachedAssetSearch(getAddress(address));
      setAsset(assetResult);
    }

    // Call the fetch function
    void fetchData();
  }, [address]);

  const displayName = prettyNames
    ? (name ?? asset?.name ?? user?.name)
    : undefined;
  const displayEmail = prettyNames ? user?.email : undefined;
  const explorerLink = getBlockExplorerAddressUrl(
    getAddress(address),
    explorerUrl
  );

  const MainView: FC = () => {
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
        <div className="mt-4">{children}</div>
      </HoverCardContent>
    </HoverCard>
  );
}
