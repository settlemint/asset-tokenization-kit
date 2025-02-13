import { getFundBalances } from './_components/data';
import { HoldersTable } from './_components/holders-table';

export default async function FundsHoldersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const balances = await getFundBalances(id);

  return <HoldersTable id={id} balances={balances} />;
}
