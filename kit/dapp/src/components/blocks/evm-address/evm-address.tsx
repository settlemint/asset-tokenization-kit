import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { shortHex } from '@/lib/hex';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';

interface EvmAddressProps extends PropsWithChildren {
  /** The EVM address to display. */
  address: string;
  /** The URL of the blockchain explorer (optional). */
  explorerUrl?: string;
  prefixLength?: number;
  suffixLength?: number;
}

/**
 * Renders an EVM address with a hover card displaying additional information.
 * @param props - The component props.
 * @returns The rendered EvmAddress component.
 */
export function EvmAddress({ address, explorerUrl, children, prefixLength = 6, suffixLength = 4 }: EvmAddressProps) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex items-center space-x-2">
          <AddressAvatar address={address} variant="tiny" />
          <span className="font-mono">{shortHex(address, prefixLength, suffixLength)}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex items-start">
          <h4 className="grid grid-cols-[auto,1fr] items-start gap-x-2 font-semibold text-sm">
            <AddressAvatar address={address} className="row-span-2" />
            <div className="flex flex-col">
              <span className="font-mono">{shortHex(address, 12, 8)}</span>
              {(explorerUrl || process.env.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT) && (
                <Link
                  prefetch={false}
                  href={`${explorerUrl ?? process.env.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT}/${address}`}
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
