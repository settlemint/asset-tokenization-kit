import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'Inspect all transactions on the network.',
};

export default function TransactionsPage() {
  return <AssetEventsTable />;
}
