import type { Address } from 'viem';
import { HoldersTable } from './_components/holders-table';

interface PageProps {
  params: Promise<{ address: Address }>;
}

export default async function StablecoinHoldersPage({ params }: PageProps) {
  const { address } = await params;
  return <HoldersTable address={address} />;
}
