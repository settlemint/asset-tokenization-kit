import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { formatNumber } from '@/lib/number';
import type { Address } from 'viem';
import type { BurnEvent } from '../asset-events-fragments';

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
            <EvmAddress address={details.from.id as Address}>
              <EvmAddressBalances address={details.from.id as Address} />
            </EvmAddress>
          </dd>
          <dt className="text-muted-foreground text-sm">Value:</dt>
          <dd className="text-sm">{formatNumber(details.value)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
