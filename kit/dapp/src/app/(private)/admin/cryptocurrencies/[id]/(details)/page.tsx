import type { PropsWithChildren } from 'react';
import { DetailsGrid } from './_components/details-grid';

interface CryptocurrencyDetailPageProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export default async function CryptocurrencyDetailPage({ params }: CryptocurrencyDetailPageProps) {
  const { id } = await params;
  return <DetailsGrid id={id} />;
}
