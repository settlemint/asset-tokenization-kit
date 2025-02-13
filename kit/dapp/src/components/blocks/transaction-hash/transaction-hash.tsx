'use client';

import { CopyToClipboard } from '@/components/ui/copy';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { shortHex } from '@/lib/hex';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';

interface TransactionHashProps extends PropsWithChildren {
  /** The transaction hash to display */
  hash: string;
  /** The URL of the blockchain explorer (optional) */
  explorerUrl?: string;
  prefixLength?: number;
  suffixLength?: number;
}

/**
 * Renders a transaction hash with a hover card displaying the full hash and a link to the explorer
 * @param props - The component props
 * @returns The rendered TransactionHash component
 */
export function TransactionHash({
  hash,
  explorerUrl,
  children,
  prefixLength = 6,
  suffixLength = 4,
}: TransactionHashProps) {
  const explorerLink = `${explorerUrl ?? process.env.NEXT_PUBLIC_SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT}tx/${hash}`;
  const shortHash = shortHex(hash, { prefixLength, suffixLength });

  return (
    <div className="flex items-center gap-2">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link
            href={explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-primary hover:underline"
          >
            {shortHash}
          </Link>
        </HoverCardTrigger>
        <HoverCardContent className="w-120">
          <div className="flex flex-col gap-2">
            <span>{hash}</span>
            <Link
              prefetch={false}
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-primary text-xs hover:underline"
            >
              View on the explorer
            </Link>
          </div>
          {children}
        </HoverCardContent>
      </HoverCard>
      <CopyToClipboard value={hash} />
    </div>
  );
}
