import { Details } from '@/app/[locale]/(private)/assets/[assettype]/[address]/(details)/_components/details';
import type { AssetType } from '@/app/[locale]/(private)/assets/[assettype]/types';
import type { Locale } from 'next-intl';
import type { Address } from 'viem';

interface PageProps {
  params: Promise<{
    locale: Locale;
    assettype: AssetType;
    address: Address;
  }>;
}

export default async function AssetDetailsPage({ params }: PageProps) {
  const { assettype, address } = await params;

  return (
    <>
      <Details assettype={assettype} address={address} />
    </>
  );
}
