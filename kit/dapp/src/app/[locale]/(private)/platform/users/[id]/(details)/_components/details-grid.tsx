import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { Badge } from "@/components/ui/badge";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { Ban, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

type DetailsGridProps = {
  id: string;
};

export async function DetailsGrid({ id }: DetailsGridProps) {
  const user = await getUserDetail({ id });
  const t = await getTranslations("private.users");

  return (
    <DetailGrid>
      <DetailGridItem label={t("detail.values.name")}>
        {user.name}
      </DetailGridItem>
      <DetailGridItem label={t("detail.values.email")}>
        {user.email}
      </DetailGridItem>
      <DetailGridItem label={t("detail.values.status")}>
        <Badge
          variant={user.banned ? "destructive" : "default"}
          className={cn(
            "bg-destructive/80 text-destructive-foreground",
            !user.banned && "bg-success/80 text-success-foreground"
          )}
        >
          {user.banned ? (
            <>
              <Ban className="mr-1 size-3" />
              <span>{t("status.banned")}</span>
            </>
          ) : (
            <>
              <Check className="mr-1 size-3" />
              <span>{t("status.active")}</span>
            </>
          )}
        </Badge>
      </DetailGridItem>
      <DetailGridItem label={t("detail.values.created_at")}>
        {formatDate(user.created_at, { type: "distance" })}
      </DetailGridItem>
      <DetailGridItem label={t("detail.values.verified_at")}>
        {user.kyc_verified_at
          ? formatDate(user.kyc_verified_at, { type: "distance" })
          : t("status.not_verified")}
      </DetailGridItem>
      <DetailGridItem label={t("detail.values.wallet")}>
        <EvmAddress
          address={user.wallet}
          prettyNames={false}
          hoverCard={false}
          copyToClipboard={true}
        />
      </DetailGridItem>
      <DetailGridItem label={t("detail.values.asset_supply")}>
        {formatNumber(user.assetCount, { decimals: 0 })}
      </DetailGridItem>
      <DetailGridItem label={t("detail.values.transactions")}>
        {formatNumber(user.transactionCount, { decimals: 0 })}
      </DetailGridItem>
      <DetailGridItem label={t("detail.values.last_activity")}>
        {user.last_activity_at
          ? formatDate(user.last_activity_at, { type: "distance" })
          : t("status.never")}
      </DetailGridItem>
      <DetailGridItem label={t("detail.values.last_login")}>
        {user.last_login_at
          ? formatDate(user.last_login_at, { type: "distance" })
          : t("status.never")}
      </DetailGridItem>
    </DetailGrid>
  );
}
