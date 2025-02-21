import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeaderSkeleton } from '@/components/layout/page-header-skeleton';
import { assetConfig } from '@/lib/config/assets';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { type PropsWithChildren, Suspense } from 'react';
import type { Address } from 'viem';
import { getEquity } from './_components/data';
import { EquityPageHeader } from './_components/page-header';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const equity = await getEquity(id);

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
  // {
  //   name: 'Permissions',
  //   href: `/admin/equities/${id}/token-permissions`,
  // },
];

export default async function DetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.asset.detail({ type: assetConfig.equity.queryKey, address: id as Address }),
    queryFn: () => getEquity(id as Address),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PageHeaderSkeleton />}>
        <EquityPageHeader id={id as Address} />
        <div className="relative mt-4 space-y-2">
          <TabNavigation items={tabs(id)} />
        </div>
        {children}
      </Suspense>
    </HydrationBoundary>
  );
}
