import { BondTable } from './_components/bond-table';

export default function BondsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Bonds</h2>
      </div>
      <BondTable />
    </>
  );
}
