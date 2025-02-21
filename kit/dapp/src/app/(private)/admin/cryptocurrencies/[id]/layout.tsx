import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeaderSkeleton } from '@/components/layout/page-header-skeleton';
import { assetConfig } from '@/lib/config/assets';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { type PropsWithChildren, Suspense } from 'react';
import type { Address } from 'viem';
import { getCryptocurrency } from './_components/data';
import { CryptocurrencyPageHeader } from './_components/page-header';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const cryptocurrency = await getCryptocurrency(id);

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
  // {
  //   name: 'Permissions',
  //   href: `/admin/cryptocurrencies/${id}/token-permissions`,
  // },
];

export default async function DetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.asset.detail({ type: assetConfig.cryptocurrency.queryKey, address: id as Address }),
    queryFn: () => getCryptocurrency(id as Address),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PageHeaderSkeleton />}>
        <CryptocurrencyPageHeader id={id as Address} />
        <div className="relative mt-4 space-y-2">
          <TabNavigation items={tabs(id)} />
        </div>
        {children}
      </Suspense>
    </HydrationBoundary>
  );
}
