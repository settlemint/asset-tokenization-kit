import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { getEquityTitle } from './_components/data';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const equity = await getEquityTitle(id);

  if (!equity) {
    return {
      title: 'Equity not found',
    };
  }

  return {
    title: equity?.name,
    openGraph: {
      images: [
        {
          url: `/share/equities/${id}/og`,
          width: 1280,
          height: 640,
          alt: equity?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/equities/${id}/og`,
          width: 1280,
          height: 640,
          alt: equity?.name,
        },
      ],
    },
  };
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/equities/${id}`,
  },
  {
    name: 'Holders',
    href: `/admin/equities/${id}/holders`,
  },
  {
    name: 'Events',
    href: `/admin/equities/${id}/events`,
  },
  {
    name: 'Block list',
    href: `/admin/equities/${id}/blocklist`,
  },
  {
    name: 'Token permissions',
    href: `/admin/equities/${id}/token-permissions`,
  },
];

export default async function FundsDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const equity = await getEquityTitle(id);

  return (
    <div>
      <PageHeader
        title={
          <>
            <span className="mr-2">{equity?.name}</span>
            <span className="text-muted-foreground">({equity?.symbol})</span>
          </>
        }
        subtitle={
          <EvmAddress address={id} prettyNames={false}>
            <EvmAddressBalances address={id} />
          </EvmAddress>
        }
        pill={<ActivePill paused={equity?.paused ?? false} />}
        // button={
        // <DropdownMenu>
        //   <DropdownMenuTrigger asChild>
        //     <Button variant="default">
        //       Mint tokens
        //       <ChevronDown className="h-4 w-4" />
        //     </Button>
        //   </DropdownMenuTrigger>
        //   <DropdownMenuContent className="relative right-10 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-0 shadow-dropdown">
        //     <DropdownMenuItem asChild className="dropdown-menu-item">
        //       <MintTokensButton
        //         address={id as Address}
        //         name={stableCoin.name}
        //         symbol={stableCoin.symbol}
        //         decimals={stableCoin.decimals}
        //       />
        //     </DropdownMenuItem>
        //     <DropdownMenuItem asChild className="dropdown-menu-item">
        //       <BurnTokensButton
        //         address={id as Address}
        //         name={stableCoin.name}
        //         symbol={stableCoin.symbol}
        //         decimals={stableCoin.decimals}
        //       />
        //     </DropdownMenuItem>
        //     <DropdownMenuItem asChild className="dropdown-menu-item">
        //       <UpdateCollateralButton
        //         address={id as Address}
        //         name={stableCoin.name}
        //         symbol={stableCoin.symbol}
        //         decimals={stableCoin.decimals}
        //       />
        //     </DropdownMenuItem>
        //   </DropdownMenuContent>
        // </DropdownMenu>
        // }
      />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs(id)} />
      </div>
      {children}
    </div>
  );
}
