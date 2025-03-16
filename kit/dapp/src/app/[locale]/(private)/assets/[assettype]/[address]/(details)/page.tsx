import type { Locale } from 'next-intl';
import type { Address } from 'viem';
import type { AssetType } from '../../types';
import { getDetailData } from '../_components/detail-data';
import { Details } from './_components/details';
import { Related } from './_components/related';

interface PageProps {
  params: Promise<{
    locale: Locale;
    assettype: AssetType;
    address: Address;
  }>;
}

export default async function AssetDetailsPage({ params }: PageProps) {
  const { assettype, address } = await params;
  const asset = await getDetailData({ assettype, address });

  return (
    <>
      <Details assettype={assettype} address={address} />
      <Related
        assettype={assettype}
        address={address}
        totalSupply={asset.totalSupply}
      />
    </>
  );
}
