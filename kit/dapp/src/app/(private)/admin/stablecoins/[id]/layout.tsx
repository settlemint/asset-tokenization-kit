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
import type { PropsWithChildren } from 'react';
import { BurnTokensButton } from './_components/button-burn-tokens';
import { MintTokensButton } from './_components/button-mint-tokens';
import { getStableCoinTitle } from './_components/data';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
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
              <MintTokensButton assetName={stableCoin?.name} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <BurnTokensButton assetName={stableCoin?.name} />
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
