import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { MintEvent } from '@/lib/queries/asset-events/asset-events-fragments';
import { formatNumber } from '@/lib/utils/number';

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
            <EvmAddress address={details.to.id}>
              <EvmAddressBalances address={details.to.id} />
            </EvmAddress>
          </dd>
          <dt className="text-muted-foreground text-sm">Value:</dt>
          <dd className="text-sm">{formatNumber(details.value)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
