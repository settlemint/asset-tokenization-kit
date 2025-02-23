import { TotalSupply } from '@/components/blocks/charts/assets/total-supply';
import { TotalSupplyChanged } from '@/components/blocks/charts/assets/total-supply-changed';
import { TotalTransfers } from '@/components/blocks/charts/assets/total-transfers';
import { TotalVolume } from '@/components/blocks/charts/assets/total-volume';
import { DetailChartGrid } from '@/components/blocks/detail-grid/detail-chart-grid';
import type { Address } from 'viem';
import { Collateral } from './_components/collateral';
import { Details } from './_components/details';

interface PageProps {
  params: Promise<{ address: Address }>;
}

export default async function StableCoinDetailPage({ params }: PageProps) {
  const { address } = await params;

  return (
    <>
      <Details address={address} />
      <Collateral address={address} />
      <DetailChartGrid>
        <TotalSupply address={address} />
        <TotalSupplyChanged address={address} />
        <TotalTransfers address={address} />
        <TotalVolume address={address} />
      </DetailChartGrid>
    </>
  );
}
