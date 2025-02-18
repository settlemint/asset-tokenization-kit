import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { formatNumber } from '@/lib/number';
import type { TokensFrozenEvent } from '../asset-events-fragments';

interface TokensFrozenDetailsProps {
  details: TokensFrozenEvent;
}

export function TokensFrozenDetails({ details }: TokensFrozenDetailsProps) {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          <dt className="text-muted-foreground text-sm">User:</dt>
          <dd className="text-sm">
            <EvmAddress address={details.user.id}>
              <EvmAddressBalances address={details.user.id} />
            </EvmAddress>
          </dd>
          <dt className="text-muted-foreground text-sm">Amount:</dt>
          <dd className="text-sm">{formatNumber(details.amount)}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
