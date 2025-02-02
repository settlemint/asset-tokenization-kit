import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { Card, CardContent } from '@/components/ui/card';
import { shortHex } from '@/lib/hex';
import type { ComponentType } from 'react';
import type { StableCoinDetail } from '../../data';

export function AssetDetailsGrid<Asset extends StableCoinDetail>({
  data,
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
          <div className="text-md">{data.name}</div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Symbol</span>
          <div className="text-md">{data.symbol}</div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">ISIN</span>
          <div className="text-md">{data.isin}</div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Contract address</span>
          <div className="text-md">
            {' '}
            <span className="truncate text-sm">{shortHex(data.id, { prefixLength: 12, suffixLength: 8 })}</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Creator</span>
          <div className="flex items-center gap-2 text-md">
            <AddressAvatar address={data.id} variant="small" />
            <span className="truncate text-sm">{shortHex(data.id, { prefixLength: 12, suffixLength: 8 })}</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Deployed on</span>
          <div className="text-md">12/06/2024</div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Total supply</span>
          <div className="text-md">{data.totalSupply}</div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Burned supply</span>
          <div className="text-md">0</div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">#Token holders</span>
          <div className="text-md">123</div>
        </div>
        <div className="col-span-2 space-y-1">
          <span className="font-medium text-muted-foreground text-sm">#Ownership concentration holders</span>
          <div className="text-md">30%</div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Current collateral ratio</span>
          <div className="text-md">{data.collateral}</div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Collateral proof expiration date</span>
          <div className="text-md">12/06/2024 - 09:41 AM</div>
        </div>
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Required collateral threshold</span>
          <div className="text-md"> {'>'} 100 %</div>
        </div>
        <div className="col-span-2 space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Collateral proof validity (seconds)</span>
          <div className="text-md">3600 seconds</div>
        </div>
      </CardContent>
    </Card>
  );
}
