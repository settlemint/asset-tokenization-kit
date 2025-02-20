import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Inspect all events on the network.',
};

export default function EventsPage() {
  return <AssetEventsTable />;
}
