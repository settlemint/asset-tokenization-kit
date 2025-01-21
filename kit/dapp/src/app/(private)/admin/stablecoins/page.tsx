import { StableCoinTable } from './_components/stablecoin-table';

export default function StableCoinsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Stable Coins</h2>
      </div>
      <StableCoinTable />
    </>
  );
}
