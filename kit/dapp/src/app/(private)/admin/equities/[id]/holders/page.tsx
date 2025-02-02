import type { PropsWithChildren } from 'react';
import { HoldersTable } from './_components/holders-table';

interface EquityHoldersPageProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export default async function EquityHoldersPage({ params }: EquityHoldersPageProps) {
  const { id } = await params;

  return <HoldersTable id={id} />;
}
