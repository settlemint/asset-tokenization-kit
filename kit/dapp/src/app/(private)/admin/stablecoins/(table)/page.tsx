import { StableCoinTable } from '@/app/(private)/admin/stablecoins/(table)/_components/table';
import { PageHeader } from '@/components/layout/page-header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stable Coins',
  description: 'View and manage your stable coins.',
};

export default function StableCoinsPage() {
  return (
    <>
      <PageHeader title="Stable Coins" />
      <StableCoinTable />
    </>
  );
}
