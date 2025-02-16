import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { BurnButton } from './_components/burn-form/button';
import { getStableCoinTitle } from './_components/data';
import { MintButton } from './_components/mint-form/button';
import { PauseButton } from './_components/pause-form/button';
import { UpdateCollateralButton } from './_components/update-collateral-form/button';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const stableCoin = await getStableCoinTitle(id);

  if (!stableCoin) {
    return {
      title: 'Stablecoin not found',
    };
  }

  return {
    title: stableCoin?.name,
    openGraph: {
      images: [
        {
          url: `/share/stablecoins/${id}/og`,
          width: 1280,
          height: 640,
          alt: stableCoin?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/stablecoins/${id}/og`,
          width: 1280,
          height: 640,
          alt: stableCoin?.name,
        },
      ],
    },
  };
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/stablecoins/${id}`,
  },
  {
    name: 'Holders',
    href: `/admin/stablecoins/${id}/holders`,
  },
  {
    name: 'Events',
    href: `/admin/stablecoins/${id}/events`,
  },
  {
    name: 'Block list',
    href: `/admin/stablecoins/${id}/blocklist`,
  },
  {
    name: 'Token permissions',
    href: `/admin/stablecoins/${id}/token-permissions`,
  },
];

export default async function FundsDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const stableCoin = await getStableCoinTitle(id);

  const hasCollateralAvailable = Number(stableCoin?.collateral ?? 0) > Number(stableCoin?.totalSupply ?? 0);
  const collateralAvailable = Number(stableCoin?.collateral ?? 0) - Number(stableCoin?.totalSupply ?? 0);

  return (
    <div>
      <PageHeader
        title={
          <>
            <span className="mr-2">{stableCoin?.name}</span>
            <span className="text-muted-foreground">({stableCoin?.symbol})</span>
          </>
        }
        subtitle={
          <EvmAddress address={id} prettyNames={false}>
            <EvmAddressBalances address={id} />
          </EvmAddress>
        }
        pill={<ActivePill paused={stableCoin?.paused ?? false} />}
        button={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default">
                Manage Stablecoin
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="relative right-10 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-0 shadow-dropdown">
              <DropdownMenuItem asChild className="dropdown-menu-item">
                <MintButton
                  address={id as Address}
                  name={stableCoin.name}
                  symbol={stableCoin.symbol}
                  decimals={stableCoin.decimals}
                  disabled={!hasCollateralAvailable}
                  collateralAvailable={collateralAvailable}
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="dropdown-menu-item">
                <BurnButton
                  address={id as Address}
                  name={stableCoin.name}
                  symbol={stableCoin.symbol}
                  decimals={stableCoin.decimals}
                  balance={Number(stableCoin.holders.length > 0 ? (stableCoin.holders[0].value ?? 0) : 0)}
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="dropdown-menu-item">
                <PauseButton
                  address={id as Address}
                  name={stableCoin.name}
                  symbol={stableCoin.symbol}
                  paused={stableCoin.paused}
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="dropdown-menu-item">
                <UpdateCollateralButton
                  address={id as Address}
                  name={stableCoin.name}
                  symbol={stableCoin.symbol}
                  decimals={stableCoin.decimals}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs(id)} />
      </div>
      {children}
    </div>
  );
}
