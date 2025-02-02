import type { PropsWithChildren } from 'react';
import { HoldersTable } from './_components/holders-table';

interface CryptocurrencyHoldersPageProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export default async function CryptocurrencyHoldersPage({ params }: CryptocurrencyHoldersPageProps) {
  const { id } = await params;

  return <HoldersTable id={id} />;
}
