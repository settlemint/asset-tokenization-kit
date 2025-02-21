import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import type { Address } from 'viem';

interface PageProps {
  params: Promise<{ id: Address }>;
}

export default async function StablecoinEventsPage({ params }: PageProps) {
  const { id } = await params;

  return <AssetEventsTable variables={{ asset: id }} />;
}
