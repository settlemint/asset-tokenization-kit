import { UpdateCollateralButton } from '@/app/(private)/admin/stablecoins/[id]/_components/update-collateral-form/button';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
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
import { BurnTokensButton } from './_components/burn-form/button';
import { getStableCoinTitle } from './_components/data';
import { MintTokensButton } from './_components/mint-form/button';

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
          url: `/admin/stablecoins/${id}/og`,
          width: 1280,
          height: 640,
          alt: stableCoin?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/admin/stablecoins/${id}/og`,
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

  return (
    <div>
      <h1 className="flex items-center font-bold text-2xl">
        <span className="mr-2">{stableCoin?.name}</span>
        <span className="text-muted-foreground">({stableCoin?.symbol})</span>
      </h1>
      <div className="flex justify-between text-muted-foreground text-sm">
        <EvmAddress address={id}>
          <EvmAddressBalances address={id} />
        </EvmAddress>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              Mint tokens
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <MintTokensButton address={id as Address} name={stableCoin.name} symbol={stableCoin.symbol} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <BurnTokensButton address={id as Address} name={stableCoin.name} symbol={stableCoin.symbol} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <UpdateCollateralButton address={id as Address} name={stableCoin.name} symbol={stableCoin.symbol} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs(id)} />
      </div>
      {children}
    </div>
  );
}
