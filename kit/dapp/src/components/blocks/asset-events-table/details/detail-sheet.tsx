import { TransactionHash } from '@/components/blocks/transaction-hash/transaction-hash';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Address } from 'viem';
import { EvmAddress } from '../../evm-address/evm-address';
import type { NormalizedEventsListItem } from '../asset-events-fragments';
import { ApprovalDetails } from './approval';
import { BondRedeemedDetails } from './bond-redeemed';
import { BurnDetails } from './burn';
import { CollateralUpdatedDetails } from './collateral-updated';
import { FeeCollectedDetails } from './fee-collected';
import { MintDetails } from './mint';
import { RoleAdminChangedDetails } from './role-admin-changed';
import { RoleGrantedDetails } from './role-granted';
import { RoleRevokedDetails } from './role-revoked';
import { TokenWithdrawnDetails } from './token-withdrawn';
import { TokensFrozenDetails } from './tokens-frozen';
import { TransferDetails } from './transfer';
import { UserBlockedDetails } from './user-blocked';
export function EventDetailSheet({
  event,
  sender,
  asset,
  timestamp,
  details,
  transactionHash,
}: NormalizedEventsListItem) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Details
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>{event}</SheetTitle>
        </SheetHeader>
        <Card>
          <CardContent className="pt-6">
            <dl className="grid grid-cols-[1fr_2fr] gap-4">
              <dt className="text-muted-foreground text-sm">Sender:</dt>
              <dd className="text-sm">
                <EvmAddress address={sender as Address} />
              </dd>
              <dt className="text-muted-foreground text-sm">Asset:</dt>
              <dd className="text-sm">
                <EvmAddress address={asset as Address} />
              </dd>
              <dt className="text-muted-foreground text-sm">Date:</dt>
              <dd className="text-sm [&:first-letter]:uppercase">{timestamp}</dd>
              <dt className="text-muted-foreground text-sm">Transaction Hash:</dt>
              <dd className="text-sm">
                <TransactionHash hash={transactionHash} />
              </dd>
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
            case 'UnpausedEvent':
            case 'UserUnblockedEvent':
            case 'UnderlyingAssetTopUpEvent':
            case 'UnderlyingAssetWithdrawnEvent':
              // These events don't have additional details to display
              return null;
            default: {
              const _exhaustiveCheck: never = details;
              return _exhaustiveCheck;
            }
          }
        })()}
      </SheetContent>
    </Sheet>
  );
}
