'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import { shortHex } from '@/lib/hex';
import Link from 'next/link';
import { type PropsWithChildren, Suspense } from 'react';

interface EvmAddressProps extends PropsWithChildren {
  /** The EVM address to display. */
  address: string;
  name?: string;
  symbol?: string;
  /** The URL of the blockchain explorer (optional). */
  explorerUrl?: string;
  prefixLength?: number;
  suffixLength?: number;
  iconSize?: 'tiny' | 'small' | 'big';
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
  iconSize = 'tiny',
}: EvmAddressProps) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex items-center space-x-2">
          <Suspense fallback={<Skeleton className="h-4 w-4 rounded-lg" />}>
            <AddressAvatar address={address} variant={iconSize} />
          </Suspense>
          {!name && <span className="font-mono">{shortHex(address, { prefixLength, suffixLength })}</span>}
          {name && (
            <span>
              {name} {symbol && <span className="text-muted-foreground text-xs">({symbol})</span>}
            </span>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-120">
        <div className="flex items-start">
          <h4 className="grid grid-cols-[auto,1fr] items-start gap-x-2 font-semibold text-sm">
            <Suspense fallback={<Skeleton className="h-8 w-8 rounded-lg" />}>
              <AddressAvatar address={address} className="row-span-2" />
            </Suspense>
            <div className="flex flex-col">
              <span className="font-mono">{address}</span>
              {name && (
                <span className="text-sm">
                  {name} {symbol && <span className="text-muted-foreground text-xs">({symbol})</span>}
                </span>
              )}
              {(explorerUrl || process.env.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT) && (
                <Link
                  prefetch={false}
                  href={`${explorerUrl ?? process.env.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT}address/${address}`}
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
