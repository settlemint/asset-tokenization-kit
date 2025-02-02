import type { PropsWithChildren } from 'react';
import { DetailsGrid } from './_components/details-grid';

interface BondDetailPageProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export default async function BondDetailPage({ params }: BondDetailPageProps) {
  const { id } = await params;
  return <DetailsGrid id={id} />;
}
