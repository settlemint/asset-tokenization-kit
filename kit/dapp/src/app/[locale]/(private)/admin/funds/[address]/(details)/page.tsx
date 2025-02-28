import { TotalSupply } from '@/components/blocks/charts/assets/total-supply';
import { TotalSupplyChanged } from '@/components/blocks/charts/assets/total-supply-changed';
import { TotalTransfers } from '@/components/blocks/charts/assets/total-transfers';
import { TotalVolume } from '@/components/blocks/charts/assets/total-volume';
import { DetailChartGrid } from '@/components/blocks/detail-grid/detail-chart-grid';
import { getFundDetail } from '@/lib/queries/fund/fund-detail';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { Details } from './_components/details';

interface PageProps {
  params: Promise<{ locale: string; address: Address }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; address: Address }>;
}): Promise<Metadata> {
  const { address, locale } = await params;
  const fund = await getFundDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: 'admin.funds.details',
  });

  return {
    title: t('details-page-title', {
      name: fund?.name,
    }),
    description: t('details-page-description', {
      name: fund?.name,
    }),
  };
}

export default async function FundDetailPage({ params }: PageProps) {
  const { address } = await params;

  return (
    <>
      <Details address={address} />
      <DetailChartGrid>
        <TotalSupply address={address} />
        <TotalSupplyChanged address={address} />
        <TotalTransfers address={address} />
        <TotalVolume address={address} />
      </DetailChartGrid>
    </>
  );
}
