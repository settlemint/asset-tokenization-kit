import { DetailsGrid } from './_components/details-grid';

export default async function CryptocurrencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetailsGrid id={id} />;
}
