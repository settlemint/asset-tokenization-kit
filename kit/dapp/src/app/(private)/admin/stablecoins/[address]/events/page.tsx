import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import type { Address } from 'viem';

interface PageProps {
  params: Promise<{ address: Address }>;
}

export default async function StablecoinEventsPage({ params }: PageProps) {
  const { address } = await params;

  return <AssetEventsTable asset={address} />;
}
