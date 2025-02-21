import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeaderSkeleton } from '@/components/layout/page-header-skeleton';
import { assetConfig } from '@/lib/config/assets';
import { getQueryClient, queryKeys } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { type PropsWithChildren, Suspense } from 'react';
import type { Address } from 'viem';
import { getBond } from './_components/data';
import { BondPageHeader } from './_components/page-header';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const bond = await getBond(id);

  if (!bond) {
    return {
      title: 'Bond not found',
    };
  }

  return {
    title: bond?.name,
    openGraph: {
      images: [
        {
          url: `/share/bonds/${id}/og`,
          width: 1280,
          height: 640,
          alt: bond?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/bonds/${id}/og`,
          width: 1280,
          height: 640,
          alt: bond?.name,
        },
      ],
    },
  };
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/bonds/${id}`,
  },
  {
    name: 'Holders',
    href: `/admin/bonds/${id}/holders`,
  },
  {
    name: 'Events',
    href: `/admin/bonds/${id}/events`,
  },
  // {
  //   name: 'Permissions',
  //   href: `/admin/bonds/${id}/token-permissions`,
  // },
];

export default async function DetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.asset.detail({ type: assetConfig.bond.queryKey, address: id as Address }),
    queryFn: () => getBond(id as Address),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PageHeaderSkeleton />}>
        <BondPageHeader id={id as Address} />
        <div className="relative mt-4 space-y-2">
          <TabNavigation items={tabs(id)} />
        </div>
        {children}
      </Suspense>
    </HydrationBoundary>
  );
}
