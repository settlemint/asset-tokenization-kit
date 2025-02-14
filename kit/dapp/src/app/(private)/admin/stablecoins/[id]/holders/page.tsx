import { getStablecoinBalances } from './_components/data';
import { HoldersTable } from './_components/holders-table';

export default async function StableCoinHoldersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const balances = await getStablecoinBalances(id);

  return <HoldersTable id={id} balances={balances} />;
}
