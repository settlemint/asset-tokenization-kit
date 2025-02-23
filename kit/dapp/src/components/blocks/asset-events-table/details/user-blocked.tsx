import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { UserBlockedEvent } from '@/lib/queries/asset-events/asset-events-fragments';

interface UserBlockedDetailsProps {
  details: UserBlockedEvent;
}

export function UserBlockedDetails({ details }: UserBlockedDetailsProps) {
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
        </dl>
      </CardContent>
    </Card>
  );
}
