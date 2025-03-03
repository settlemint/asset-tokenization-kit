import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { Badge } from "@/components/ui/badge";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { Ban, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

type DetailsGridProps = {
  id: string;
};

export async function DetailsGrid({ id }: DetailsGridProps) {
  const user = await getUserDetail({ id });
  const t = await getTranslations("admin.users.detail.fields");
  const tStatus = await getTranslations("admin.users.status");
  const tValues = await getTranslations("admin.users.detail.values");

  return (
    <DetailGrid>
      <DetailGridItem label={t("name")}>{user.name}</DetailGridItem>
      <DetailGridItem label={t("email")}>{user.email}</DetailGridItem>
      <DetailGridItem label={t("status")}>
        <Badge variant={user.banned ? "destructive" : "default"}>
          {user.banned ? (
            <>
              <Ban className="mr-1 size-3" />
              <span>{tStatus("banned")}</span>
            </>
          ) : (
            <>
              <Check className="mr-1 size-3" />
              <span>{tStatus("active")}</span>
            </>
          )}
        </Badge>
      </DetailGridItem>
      <DetailGridItem label={t("created_at")}>
        {formatDate(user.created_at, { type: "distance" })}
      </DetailGridItem>
      <DetailGridItem label={t("verified_at")}>
        {user.kyc_verified
          ? formatDate(user.kyc_verified, { type: "distance" })
          : tValues("not_verified")}
      </DetailGridItem>
      <DetailGridItem label={t("wallet")}>
        <EvmAddress
          address={user.wallet}
          prettyNames={false}
          hoverCard={false}
          copyToClipboard={true}
        />
      </DetailGridItem>
      <DetailGridItem label={t("asset_supply")}>
        {formatNumber(user.assetCount, { decimals: 0 })}
      </DetailGridItem>
      <DetailGridItem label={t("transactions")}>
        {formatNumber(user.transactionCount, { decimals: 0 })}
      </DetailGridItem>
      <DetailGridItem label={t("last_activity")}>
        {user.lastActivity
          ? formatDate(user.lastActivity, { type: "distance" })
          : tValues("never")}
      </DetailGridItem>
      <DetailGridItem label={t("last_login")}>
        {user.last_login
          ? formatDate(user.last_login, { type: "distance" })
          : tValues("never")}
      </DetailGridItem>
    </DetailGrid>
  );
}
