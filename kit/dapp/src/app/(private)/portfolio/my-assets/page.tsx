import { PageHeader } from '@/components/layout/page-header';
import { MyAssets } from './(table)/table';

export default function MyAssetsPage() {
  return (
    <>
      <PageHeader title="My Assets" />
      <MyAssets />
    </>
  );
}
