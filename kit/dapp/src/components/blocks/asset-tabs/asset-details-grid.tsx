import { Card, CardContent } from '@/components/ui/card';
import { shortHex } from '@/lib/hex';
import type { ComponentType } from 'react';
import { AddressAvatar } from '../address-avatar/address-avatar';

export function AssetDetailsGrid<
  Asset extends {
    id: string;
    name: string | null;
    symbol: string | null;
    isin: string | null;
    totalSupply: string;
    totalSupplyExact: string;
    collateral: string;
    collateralExact: string;
  },
>({
  data,
  icons,
  name,
  cells,
}: {
  data: Asset;
  icons: Record<string, ComponentType<{ className?: string }>>;
  name: string;
  cells: unknown;
}) {
  return (
    <Card className="py-4">
      <CardContent className="grid grid-cols-6 gap-x-4 gap-y-8">
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Name</span>
          <p className="text-md">{data.name}</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Symbol</span>
          <p className="text-md">{data.symbol}</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">ISIN</span>
          <p className="text-md">{data.isin}</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Contract address</span>
          <p className="text-md">
            {' '}
            <span className="truncate text-sm">{shortHex(data.id, 12, 8)}</span>
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Creator</span>
          <p className="flex items-center gap-2 text-md">
            <AddressAvatar address={data.id} variant="small" />
            <span className="truncate text-sm">{shortHex(data.id, 12, 8)}</span>
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Deployed on</span>
          <p>12/06/2024</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Total supply</span>
          <p className="text-md">{data.totalSupply}</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Circulating supply</span>
          <p className="text-md">{data.totalSupplyExact}</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Burned supply</span>
          <p className="text-md">0</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">#Token holders</span>
          <p className="text-md">123</p>
        </div>
        <div className="col-span-2 space-y-1">
          <span className="font-medium text-muted-foreground text-sm">#Ownership concentration holders</span>
          <p className="text-md">30%</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Proven collateral</span>
          <p className="text-md">{data.collateralExact}</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Current collateral ratio</span>
          <p className="text-md">{data.collateral}</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Collateral proof expiration date</span>
          <p className="text-md">12/06/2024 - 09:41 AM</p>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Required collateral threshold</span>
          <p className="text-md"> {'>'} 100 %</p>
        </div>
        <div className="col-span-2 space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Collateral proof validity (seconds)</span>
          <p>3600 seconds</p>
        </div>
      </CardContent>
    </Card>
  );
}
