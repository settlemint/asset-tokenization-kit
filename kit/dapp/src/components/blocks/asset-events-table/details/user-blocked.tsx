import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { UserBlockedEvent } from '../asset-events-fragments';

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
