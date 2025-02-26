import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { BurnEvent } from '@/lib/queries/asset-events/asset-events-fragments';
import { formatNumber } from '@/lib/utils/number';

interface BurnDetailsProps {
  details: BurnEvent;
}

export function BurnDetails({ details }: BurnDetailsProps) {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          <dt className="text-muted-foreground text-sm">From:</dt>
          <dd className="text-sm">
            <EvmAddress address={details.from.id}>
              <EvmAddressBalances address={details.from.id} />
            </EvmAddress>
          </dd>
          <dt className="text-muted-foreground text-sm">Value:</dt>
          <dd className="text-sm">{formatNumber(details.value)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
