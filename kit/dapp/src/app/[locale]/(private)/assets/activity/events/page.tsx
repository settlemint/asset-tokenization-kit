import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ sender: string }>;
}) {
  const { sender } = await searchParams;
  return (
    <AssetEventsTable
      initialColumnFilters={sender ? [{ id: 'sender', value: [sender] }] : []}
    />
  );
}
