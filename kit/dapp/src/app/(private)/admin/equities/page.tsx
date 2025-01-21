import { EquityTable } from './_components/equity-table';

export default function EquityPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Equity</h2>
      </div>
      <EquityTable />
    </>
  );
}
