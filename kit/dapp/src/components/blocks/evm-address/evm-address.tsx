'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { Badge } from '@/components/ui/badge';
import { CopyToClipboard } from '@/components/ui/copy';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryKeys } from '@/hooks/use-query-keys';
import { getBlockExplorerAddressUrl } from '@/lib/block-explorer';
import { shortHex } from '@/lib/hex';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { type FC, type PropsWithChildren, Suspense } from 'react';
import type { Address } from 'viem';
import { getAddress } from 'viem';

interface EvmAddressProps extends PropsWithChildren {
  /** The EVM address to display. */
  address: Address;
  name?: string;
  symbol?: string;
  /** The URL of the blockchain explorer (optional). */
  explorerUrl?: string;
  prefixLength?: number;
  suffixLength?: number;
  iconSize?: 'tiny' | 'small' | 'big';
  prettyNames?: boolean;
  verbose?: boolean;
  hoverCard?: boolean;
  copyToClipboard?: boolean;
}

interface User {
  name: string;
  image: string | null;
  email: string;
}

interface Asset {
  name: string;
  symbol: string;
}

const EvmAddressUser = hasuraGraphql(`
  query EvmAddressUser($id: String!) {
    user(where: { wallet: { _eq: $id } }) {
      name
      image
      email
    }
  }
`);

const EvmAddressAsset = theGraphGraphqlStarterkits(`
  query EvmAddressAsset($id: ID = "") {
    asset(id: $id) {
      name
      symbol
    }
  }
`);

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
  iconSize = 'tiny',
  prettyNames = true,
  verbose = false,
  hoverCard = true,
  copyToClipboard = false,
}: EvmAddressProps) {
  const { keys } = useQueryKeys();
  const { data: user } = useSuspenseQuery<User | null>({
    queryKey: keys.users.detail(address),
    queryFn: async () => {
      const result = await hasuraClient.request(EvmAddressUser, {
        id: getAddress(address),
      });
      return result.user[0] ?? null;
    },
  });

  const { data: asset } = useSuspenseQuery<Asset | null>({
    queryKey: keys.assets.detail('all', address),
    queryFn: async () => {
      try {
        const result = await theGraphClientStarterkits.request(EvmAddressAsset, {
          id: getAddress(address),
        });
        return result.asset ?? null;
      } catch {
        return null;
      }
    },
  });

  const displayName = prettyNames ? (name ?? asset?.name ?? user?.name) : undefined;
  const displayEmail = prettyNames ? user?.email : undefined;
  const explorerLink = getBlockExplorerAddressUrl(address, explorerUrl);

  const MainView: FC = () => {
    return (
      <div className="flex items-center space-x-2">
        <Suspense fallback={<Skeleton className="h-4 w-4 rounded-lg" />}>
          <AddressAvatar address={address} variant={iconSize} imageUrl={user?.image} email={displayEmail} />
        </Suspense>
        {!displayName && <span className="font-mono">{shortHex(address, { prefixLength, suffixLength })}</span>}
        {displayName && (
          <span>
            {displayName} {symbol && <span className="text-muted-foreground text-xs">({symbol}) </span>}
            {verbose && (
              <Badge variant="secondary" className="font-mono">
                {shortHex(address, { prefixLength, suffixLength })}
              </Badge>
            )}
          </span>
        )}
        {copyToClipboard && <CopyToClipboard value={address} />}
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
          <h4 className="grid grid-cols-[auto,1fr] items-start gap-x-2 font-semibold text-sm">
            <Suspense fallback={<Skeleton className="h-8 w-8 rounded-lg" />}>
              <AddressAvatar address={address} imageUrl={user?.image} email={displayEmail} className="row-span-2" />
            </Suspense>
            <div className="flex flex-col">
              <span className="font-mono">{address}</span>
              {displayName && (
                <span className="text-sm">
                  {displayName} {symbol && <span className="text-muted-foreground text-xs">({symbol})</span>}
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
        {children}
      </HoverCardContent>
    </HoverCard>
  );
}
