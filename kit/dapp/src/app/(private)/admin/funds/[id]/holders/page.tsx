import type { PropsWithChildren } from 'react';
import { HoldersTable } from './_components/holders-table';

interface FundsHoldersPageProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export default async function FundsHoldersPage({ params }: FundsHoldersPageProps) {
  const { id } = await params;

  return <HoldersTable id={id} />;
}
