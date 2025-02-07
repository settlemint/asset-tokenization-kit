import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { CopyToClipboard } from '@/components/ui/copy';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { formatNumber } from '@/lib/number';
import { formatAssetType } from '@/lib/utils/format-asset-type';
import type { PropsWithChildren } from 'react';
import { getMyAsset } from '../../_components/data';

type DetailsGridProps = {
  id: string;
};

export async function DetailsGrid({ id }: DetailsGridProps) {
  const myAsset = await getMyAsset(id);

  if (!myAsset) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Asset not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="py-4">
      <CardContent className="grid grid-cols-3 gap-x-4 gap-y-8">
        <DetailsGridItem label="Name">{myAsset.asset.name}</DetailsGridItem>
        <DetailsGridItem label="Symbol">{myAsset.asset.symbol}</DetailsGridItem>
        <DetailsGridItem label="Type">{formatAssetType(myAsset.asset.type)}</DetailsGridItem>
        {myAsset.asset.__typename === 'StableCoin' && (
          <>
            <DetailsGridItem label="ISIN">{myAsset.asset.isin}</DetailsGridItem>
            <DetailsGridItem label="Contract address">
              <div className="flex items-center">
                <EvmAddress address={myAsset.asset.id}>
                  <EvmAddressBalances address={myAsset.asset.id} />
                </EvmAddress>
                <CopyToClipboard value={myAsset.asset.id} displayText={''} className="ml-2" />
              </div>
            </DetailsGridItem>
            <DetailsGridItem label="Total supply">{formatNumber(myAsset.asset.totalSupplyExact)}</DetailsGridItem>
            <DetailsGridItem label="Proven collateral (ratio)">
              {formatNumber(Number(myAsset.asset.collateralExact) / Number(myAsset.asset.totalSupplyExact), {
                percentage: true,
              })}
            </DetailsGridItem>
          </>
        )}
        <DetailsGridItem label="Balance">{formatNumber(myAsset.valueExact)}</DetailsGridItem>
      </CardContent>
    </Card>
  );
}

interface DetailsGridItemProps extends PropsWithChildren {
  label: string;
}

export function DetailsGridItem({ label, children }: DetailsGridItemProps) {
  return (
    <div className="space-y-1">
      <span className="font-medium text-muted-foreground text-sm">{label}</span>
      <div className="text-md">{children}</div>
    </div>
  );
}
