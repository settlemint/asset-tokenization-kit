import { PageHeader } from '@/components/layout/page-header';
import type { Metadata } from 'next';
import { StableCoinTable } from './_components/table';

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
