import { HoldersTable } from './_components/holders-table';

export default async function FundsHoldersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <HoldersTable id={id} />;
}
