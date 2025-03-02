import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { Badge } from "@/components/ui/badge";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { Ban, Check } from "lucide-react";

type DetailsGridProps = {
  id: string;
};

export async function DetailsGrid({ id }: DetailsGridProps) {
  const user = await getUserDetail({ id });

  return (
    <DetailGrid>
      <DetailGridItem label="Name">{user.name}</DetailGridItem>
      <DetailGridItem label="Email">{user.email}</DetailGridItem>
      <DetailGridItem label="Status">
        <Badge variant={user.banned ? "destructive" : "default"}>
          {user.banned ? (
            <>
              <Ban className="mr-1 h-3 w-3" />
              <span>Banned</span>
            </>
          ) : (
            <>
              <Check className="mr-1 h-3 w-3" />
              <span>Active</span>
            </>
          )}
        </Badge>
      </DetailGridItem>
      <DetailGridItem label="Created at">
        {formatDate(user.created_at, { type: "distance" })}
      </DetailGridItem>
      <DetailGridItem label="Verified at">
        {user.kyc_verified
          ? formatDate(user.kyc_verified, { type: "distance" })
          : "Not Verified"}
      </DetailGridItem>
      <DetailGridItem label="Wallet">
        <EvmAddress
          address={user.wallet}
          prettyNames={false}
          hoverCard={false}
          copyToClipboard={true}
        />
      </DetailGridItem>
      <DetailGridItem label="Asset supply">
        {formatNumber(user.assetCount, { decimals: 0 })}
      </DetailGridItem>
      <DetailGridItem label="Transactions">
        {formatNumber(user.transactionCount, { decimals: 0 })}
      </DetailGridItem>
      <DetailGridItem label="Last activity">
        {user.lastActivity
          ? formatDate(user.lastActivity, { type: "distance" })
          : "Never"}
      </DetailGridItem>
      <DetailGridItem label="Last login">
        {user.last_login
          ? formatDate(user.last_login, { type: "distance" })
          : "Never"}
      </DetailGridItem>
    </DetailGrid>
  );
}
