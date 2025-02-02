import type { PropsWithChildren } from 'react';
import { DetailsGrid } from './_components/details-grid';

interface FundsDetailPageProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export default async function FundsDetailPage({ params }: FundsDetailPageProps) {
  const { id } = await params;
  return <DetailsGrid id={id} />;
}
