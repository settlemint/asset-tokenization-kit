import type { Address } from 'viem';
import { PermissionsTable } from './_components/permissions-table';

interface PageProps {
  params: Promise<{ address: Address }>;
}

export default async function StablecoinTokenPermissionsPage({
  params,
}: PageProps) {
  const { address } = await params;

  return <PermissionsTable address={address} />;
}
