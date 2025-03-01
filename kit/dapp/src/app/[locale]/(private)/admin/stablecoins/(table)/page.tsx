import { useStableCoinColumns } from '@/app/[locale]/(private)/admin/stablecoins/(table)/_components/columns';
import { DataTable } from '@/components/blocks/data-table/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getStableCoinList } from '@/lib/queries/stablecoin/stablecoin-list';
import { Info } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'admin.stablecoins.table',
  });

  return {
    title: t('page-title'),
    description: t('page-description'),
  };
}

export default async function StableCoinsPage() {
  const t = await getTranslations('admin.stablecoins.table');
  const stablecoins = await getStableCoinList();

  return (
    <>
      <PageHeader title={t('page-title')} />

      <Alert variant="default" className="border-dashed border-primary">
        <Info className="h-4 w-4" />
        <AlertTitle>
          Stablecoins are digital currencies designed to maintain a stable value
          by being backed by real-world assets or reserves.
        </AlertTitle>
        <AlertDescription>
          They offer the advantages of digital assets—such as speed,
          transparency, and programmability—while avoiding price volatility
          typically associated with cryptocurrencies. The StableCoin contract
          ensures every token issued is fully collateralized, providing
          institutions with secure, auditable, and reliable digital money
          management. Key features include collateral-backed issuance,
          comprehensive role-based controls, robust pause mechanisms, and
          regulatory compliance capabilities.
        </AlertDescription>
      </Alert>

      <DataTable
        columnHook={useStableCoinColumns}
        data={stablecoins}
        name={'stablecoins'}
      />
    </>
  );
}
