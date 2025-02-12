import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { EvmAddress } from '../evm-address/evm-address';
import { ApprovalDetails } from './details/approval';
import { BondRedeemedDetails } from './details/bond-redeemed';
import { BurnDetails } from './details/burn';
import { CollateralUpdatedDetails } from './details/collateral-updated';
import { FeeCollectedDetails } from './details/fee-collected';
import { MintDetails } from './details/mint';
import { RoleAdminChangedDetails } from './details/role-admin-changed';
import { RoleGrantedDetails } from './details/role-granted';
import { RoleRevokedDetails } from './details/role-revoked';
import { TokenWithdrawnDetails } from './details/token-withdrawn';
import { TokensFrozenDetails } from './details/tokens-frozen';
import { TransferDetails } from './details/transfer';
import { UserBlockedDetails } from './details/user-blocked';
import type { NormalizedTransactionListItem } from './fragments';

export function EventDetailSheet({ event, sender, asset, timestamp, details }: NormalizedTransactionListItem) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Details
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{event}</SheetTitle>
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-[1fr_2fr] gap-4">
                <dt className="text-muted-foreground text-sm">Sender:</dt>
                <dd className="text-sm">
                  <EvmAddress address={sender} />
                </dd>
                <dt className="text-muted-foreground text-sm">Asset:</dt>
                <dd className="text-sm">
                  <EvmAddress address={asset} />
                </dd>
                <dt className="text-muted-foreground text-sm">Date:</dt>
                <dd className="text-sm">{timestamp}</dd>
              </dl>
            </CardContent>
          </Card>
          {(() => {
            switch (details.__typename) {
              case 'ApprovalEvent':
                return <ApprovalDetails details={details} />;
              case 'BondRedeemedEvent':
                return <BondRedeemedDetails details={details} />;
              case 'BurnEvent':
                return <BurnDetails details={details} />;
              case 'CollateralUpdatedEvent':
                return <CollateralUpdatedDetails details={details} />;
              case 'ManagementFeeCollectedEvent':
              case 'PerformanceFeeCollectedEvent':
                return <FeeCollectedDetails details={details} />;
              case 'MintEvent':
                return <MintDetails details={details} />;
              case 'RoleAdminChangedEvent':
                return <RoleAdminChangedDetails details={details} />;
              case 'RoleGrantedEvent':
                return <RoleGrantedDetails details={details} />;
              case 'RoleRevokedEvent':
                return <RoleRevokedDetails details={details} />;
              case 'TokenWithdrawnEvent':
                return <TokenWithdrawnDetails details={details} />;
              case 'TokensFrozenEvent':
                return <TokensFrozenDetails details={details} />;
              case 'TransferEvent':
                return <TransferDetails details={details} />;
              case 'UserBlockedEvent':
                return <UserBlockedDetails details={details} />;
              case 'AssetCreatedEvent':
              case 'BondMaturedEvent':
              case 'PausedEvent':
              case 'TokensUnfrozenEvent':
              case 'UnpausedEvent':
              case 'UserUnblockedEvent':
                // These events don't have additional details to display
                return null;
              default: {
                const _exhaustiveCheck: never = details;
                return _exhaustiveCheck;
              }
            }
          })()}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
