import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { formatNumber } from '@/lib/number';
import type { Address } from 'viem';
import type { MintEvent } from '../asset-events-fragments';

interface MintDetailsProps {
  details: MintEvent;
}

export function MintDetails({ details }: MintDetailsProps) {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          <dt className="text-muted-foreground text-sm">To:</dt>
          <dd className="text-sm">
            <EvmAddress address={details.to.id as Address}>
              <EvmAddressBalances address={details.to.id as Address} />
            </EvmAddress>
          </dd>
          <dt className="text-muted-foreground text-sm">Value:</dt>
          <dd className="text-sm">{formatNumber(details.value)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
