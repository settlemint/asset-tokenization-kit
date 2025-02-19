import { MyAssetsTable } from '@/components/blocks/my-assets/my-assets';
import { PageHeader } from '@/components/layout/page-header';

export default function MyAssetsPage() {
  return (
    <>
      <PageHeader title="My Assets" />
      <MyAssetsTable />
    </>
  );
}
