import type { PropsWithChildren } from 'react';
import { DetailsGrid } from './_components/details-grid';

interface EquityDetailPageProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export default async function EquityDetailPage({ params }: EquityDetailPageProps) {
  const { id } = await params;
  return <DetailsGrid id={id} />;
}
