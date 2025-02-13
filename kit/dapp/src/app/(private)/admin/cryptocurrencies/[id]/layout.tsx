import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { getCryptocurrencyTitle } from './_components/data';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const cryptocurrency = await getCryptocurrencyTitle(id);

  if (!cryptocurrency) {
    return {
      title: 'Cryptocurrency not found',
    };
  }

  return {
    title: cryptocurrency?.name,
    openGraph: {
      images: [
        {
          url: `/share/cryptocurrencies/${id}/og`,
          width: 1280,
          height: 640,
          alt: cryptocurrency?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/cryptocurrencies/${id}/og`,
          width: 1280,
          height: 640,
          alt: cryptocurrency?.name,
        },
      ],
    },
  };
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/cryptocurrencies/${id}`,
  },
  {
    name: 'Holders',
    href: `/admin/cryptocurrencies/${id}/holders`,
  },
  {
    name: 'Events',
    href: `/admin/cryptocurrencies/${id}/events`,
  },
  {
    name: 'Block list',
    href: `/admin/cryptocurrencies/${id}/blocklist`,
  },
  {
    name: 'Token permissions',
    href: `/admin/cryptocurrencies/${id}/token-permissions`,
  },
];

export default async function FundsDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const cryptocurrency = await getCryptocurrencyTitle(id);

  return (
    <div>
      <PageHeader
        title={
          <>
            <span className="mr-2">{cryptocurrency?.name}</span>
            <span className="text-muted-foreground">({cryptocurrency?.symbol})</span>
          </>
        }
        subtitle={
          <EvmAddress address={id} prettyNames={false}>
            <EvmAddressBalances address={id} />
          </EvmAddress>
        }
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
