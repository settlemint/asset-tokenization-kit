import { MyAssetsTable } from '@/app/(private)/portfolio/my-assets/_components/table';

export default function MyAssetsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">My Assets</h2>
      </div>
      <MyAssetsTable />
    </>
  );
}
