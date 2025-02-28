import { TotalSupply } from '@/components/blocks/charts/assets/total-supply';
import { TotalSupplyChanged } from '@/components/blocks/charts/assets/total-supply-changed';
import { TotalTransfers } from '@/components/blocks/charts/assets/total-transfers';
import { TotalVolume } from '@/components/blocks/charts/assets/total-volume';
import { DetailChartGrid } from '@/components/blocks/detail-grid/detail-chart-grid';
import { getCryptoCurrencyDetail } from '@/lib/queries/cryptocurrency/cryptocurrency-detail';
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
  const cryptocurrency = await getCryptoCurrencyDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: 'admin.cryptocurrencies.details',
  });

  return {
    title: t('details-page-title', {
      name: cryptocurrency?.name,
    }),
    description: t('details-page-description', {
      name: cryptocurrency?.name,
    }),
  };
}

export default async function CryptoCurrencyDetailPage({ params }: PageProps) {
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
