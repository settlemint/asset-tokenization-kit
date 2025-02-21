import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeaderSkeleton } from '@/components/layout/page-header-skeleton';
import {} from '@/components/ui/dropdown-menu';
import { assetConfig } from '@/lib/config/assets';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { type PropsWithChildren, Suspense } from 'react';
import type { Address } from 'viem';
import { getFund } from './_components/data';
import { FundPageHeader } from './_components/page-header';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const fund = await getFund(id);

  if (!fund) {
    return {
      title: 'Fund not found',
    };
  }

  return {
    title: fund?.name,
    openGraph: {
      images: [
        {
          url: `/share/funds/${id}/og`,
          width: 1280,
          height: 640,
          alt: fund?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/funds/${id}/og`,
          width: 1280,
          height: 640,
          alt: fund?.name,
        },
      ],
    },
  };
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/funds/${id}`,
  },
  {
    name: 'Holders',
    href: `/admin/funds/${id}/holders`,
  },
  {
    name: 'Events',
    href: `/admin/funds/${id}/events`,
  },
  // {
  //   name: 'Permissions',
  //   href: `/admin/funds/${id}/token-permissions`,
  // },
];

export default async function DetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.asset.detail({ type: assetConfig.fund.queryKey, address: id as Address }),
    queryFn: () => getFund(id as Address),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PageHeaderSkeleton />}>
        <FundPageHeader id={id as Address} />
        <div className="relative mt-4 space-y-2">
          <TabNavigation items={tabs(id)} />
        </div>
        {children}
      </Suspense>
    </HydrationBoundary>
  );
}
