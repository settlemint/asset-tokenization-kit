'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { Badge } from '@/components/ui/badge';
import { CopyToClipboard } from '@/components/ui/copy';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/i18n/routing';
import { getBlockExplorerAddressUrl } from '@/lib/block-explorer';
import { useOptionalAssetDetail } from '@/lib/queries/asset/asset-detail';
import { useOptionalUserDetail } from '@/lib/queries/user/user-detail';
import { shortHex } from '@/lib/utils/hex';
import {
  type FC,
  memo,
  type PropsWithChildren,
  Suspense,
  useMemo,
} from 'react';
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

// Memoized AddressAvatar to prevent unnecessary re-renders
const MemoizedAddressAvatar = memo(AddressAvatar);

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
  const checksumAddress = useMemo(() => getAddress(address), [address]);

  const userLookup = useOptionalUserDetail({
    id: checksumAddress,
  });
  const assetLookup = useOptionalAssetDetail({
    address: checksumAddress,
  });

  const displayName = useMemo(
    () =>
      prettyNames
        ? (name ?? assetLookup?.data?.name ?? userLookup?.data?.name)
        : undefined,
    [prettyNames, name, assetLookup?.data?.name, userLookup?.data?.name]
  );

  const displayEmail = useMemo(
    () => (prettyNames ? userLookup?.data?.email : undefined),
    [prettyNames, userLookup?.data?.email]
  );

  const explorerLink = useMemo(
    () => getBlockExplorerAddressUrl(checksumAddress, explorerUrl),
    [checksumAddress, explorerUrl]
  );

  // Memoized shortened address
  const shortAddress = useMemo(
    () => shortHex(checksumAddress, { prefixLength, suffixLength }),
    [checksumAddress, prefixLength, suffixLength]
  );

  // Memoized MainView component
  const MainView = useMemo(() => {
    const Component: FC = () => {
      return (
        <div className="flex items-center space-x-2">
          <MemoizedAddressAvatar
            address={checksumAddress}
            size={iconSize}
            email={displayEmail}
          />
          {!displayName && <span className="font-mono">{shortAddress}</span>}
          {displayName && (
            <span>
              {displayName}{' '}
              {symbol && (
                <span className="text-muted-foreground text-xs">
                  ({symbol}){' '}
                </span>
              )}
              {verbose && (
                <Badge variant="secondary" className="font-mono">
                  {shortAddress}
                </Badge>
              )}
            </span>
          )}
          {copyToClipboard && <CopyToClipboard value={checksumAddress} />}
        </div>
      );
    };
    return memo(Component);
  }, [
    checksumAddress,
    iconSize,
    displayEmail,
    displayName,
    shortAddress,
    symbol,
    verbose,
    copyToClipboard,
  ]);

  if (!hoverCard) {
    return <MainView />;
  }

  return (
    <div className="flex items-center">
      <HoverCard>
        <HoverCardTrigger>
          <MainView />
        </HoverCardTrigger>
        <HoverCardContent className="w-120">
          <div className="flex items-start">
            <h4 className="grid grid-cols-[auto,1fr] items-start gap-x-2 font-semibold text-sm">
              <Suspense fallback={<Skeleton className="h-8 w-8 rounded-lg" />}>
                <MemoizedAddressAvatar
                  address={checksumAddress}
                  email={displayEmail}
                  className="row-span-2"
                />
              </Suspense>
              <div className="flex flex-col">
                <span className="font-mono">{checksumAddress}</span>
                {displayName && (
                  <span className="text-sm">
                    {displayName}{' '}
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
          {children}
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
