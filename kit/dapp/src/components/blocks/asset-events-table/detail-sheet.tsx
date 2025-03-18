import { TransactionHash } from "@/components/blocks/transaction-hash/transaction-hash";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NormalizedEventsListItem } from "@/lib/queries/asset-events/asset-events-fragments";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { ColumnAssetType } from "../asset-info/column-asset-type";
import { EvmAddress } from "../evm-address/evm-address";
import { ApprovalDetails } from "./details/approval";
import { BondRedeemedDetails } from "./details/bond-redeemed";
import { BurnDetails } from "./details/burn";
import { CollateralUpdatedDetails } from "./details/collateral-updated";
import { FeeCollectedDetails } from "./details/fee-collected";
import { MintDetails } from "./details/mint";
import { RoleAdminChangedDetails } from "./details/role-admin-changed";
import { RoleGrantedDetails } from "./details/role-granted";
import { RoleRevokedDetails } from "./details/role-revoked";
import { TokenWithdrawnDetails } from "./details/token-withdrawn";
import { TokensFrozenDetails } from "./details/tokens-frozen";
import { TransferDetails } from "./details/transfer";
import { UserBlockedDetails } from "./details/user-blocked";

export function EventDetailSheet({
  event,
  sender,
  asset,
  timestamp,
  details,
  transactionHash,
  assetType,
}: NormalizedEventsListItem) {
  const t = useTranslations("components.asset-events-table.detail-sheet");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {t("details-button")}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>{event}</SheetTitle>
          <SheetDescription>
            {t("details-for-event", { event })}
          </SheetDescription>
        </SheetHeader>
        <div className="mx-4 overflow-auto">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-[1fr_2fr] gap-4">
                <dt className="text-muted-foreground text-sm">
                  {t("sender")}:
                </dt>
                <dd className="text-sm">
                  <EvmAddress address={sender as Address} />
                </dd>
                <dt className="text-muted-foreground text-sm">
                  {t("asset-type")}:
                </dt>
                <dd className="text-sm">
                  <ColumnAssetType assettype={assetType} />
                </dd>
                <dt className="text-muted-foreground text-sm">{t("asset")}:</dt>
                <dd className="text-sm">
                  <EvmAddress address={asset as Address} />
                </dd>
                <dt className="text-muted-foreground text-sm">{t("date")}:</dt>
                <dd className="text-sm first-letter:uppercase">{timestamp}</dd>
                <dt className="text-muted-foreground text-sm">
                  {t("transaction-hash")}:
                </dt>
                <dd className="text-sm">
                  <TransactionHash hash={transactionHash} />
                </dd>
              </dl>
            </CardContent>
          </Card>
          <div className="mt-6 mb-6">
            {(() => {
              switch (details.__typename) {
                case "ApprovalEvent":
                  return <ApprovalDetails details={details} />;
                case "BondRedeemedEvent":
                  return <BondRedeemedDetails details={details} />;
                case "BurnEvent":
                  return <BurnDetails details={details} />;
                case "CollateralUpdatedEvent":
                  return <CollateralUpdatedDetails details={details} />;
                case "ManagementFeeCollectedEvent":
                case "PerformanceFeeCollectedEvent":
                  return <FeeCollectedDetails details={details} />;
                case "MintEvent":
                  return <MintDetails details={details} />;
                case "RoleAdminChangedEvent":
                  return <RoleAdminChangedDetails details={details} />;
                case "RoleGrantedEvent":
                  return <RoleGrantedDetails details={details} />;
                case "RoleRevokedEvent":
                  return <RoleRevokedDetails details={details} />;
                case "TokenWithdrawnEvent":
                  return <TokenWithdrawnDetails details={details} />;
                case "TokensFrozenEvent":
                  return <TokensFrozenDetails details={details} />;
                case "TransferEvent":
                  return <TransferDetails details={details} />;
                case "UserBlockedEvent":
                  return <UserBlockedDetails details={details} />;
                case "AssetCreatedEvent":
                case "BondMaturedEvent":
                case "PausedEvent":
                case "UnpausedEvent":
                case "UserUnblockedEvent":
                case "UnderlyingAssetTopUpEvent":
                case "UnderlyingAssetWithdrawnEvent":
                  // These events don't have additional details to display
                  return null;
                default: {
                  const _exhaustiveCheck: never = details;
                  return _exhaustiveCheck;
                }
              }
            })()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
