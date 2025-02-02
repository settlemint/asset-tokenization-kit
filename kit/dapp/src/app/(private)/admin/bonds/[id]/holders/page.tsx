import type { PropsWithChildren } from 'react';
import { HoldersTable } from './_components/holders-table';

interface BondHoldersPageProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export default async function BondHoldersPage({ params }: BondHoldersPageProps) {
  const { id } = await params;

  return <HoldersTable id={id} />;
}
