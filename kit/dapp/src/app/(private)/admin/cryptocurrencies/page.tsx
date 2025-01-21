import { CryptocurrencyTable } from './_components/cryptocurrency-table';

export default function CryptocurrenciesPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Crypto Currencies</h2>
      </div>
      <CryptocurrencyTable />
    </>
  );
}
