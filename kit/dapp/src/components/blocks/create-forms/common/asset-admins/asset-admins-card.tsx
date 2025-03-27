import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Address } from "viem";

interface AssetAdmin {
  wallet?: Address;
  roles?: ("admin" | "user-manager" | "issuer")[];
}

interface TokenAdminsCardProps {
  userDetails: {
    wallet: Address;
  };
  assetAdmins?: AssetAdmin[];
}

export function AssetAdminsCard({ userDetails, assetAdmins }: TokenAdminsCardProps) {
  const t = useTranslations("private.assets.create");

  if (!assetAdmins) {
    return null;
  }

  return (
    <FormSummaryDetailCard
      title={t("summary.asset-admins-title")}
      description={t("summary.asset-admins-description")}
      icon={<Users className="size-3 text-primary-foreground" />}
    >
      <FormSummaryDetailItem
        key={userDetails.wallet}
        label={<EvmAddress address={userDetails.wallet} prettyNames />}
        value={
          <div className="flex flex-wrap gap-1">
            <Badge key="admin" variant="outline" className="text-xs">
              {t("form.steps.asset-admins.roles.admin")}
            </Badge>
            <Badge key="user-manager" variant="outline" className="text-xs">
              {t("form.steps.asset-admins.roles.user-manager")}
            </Badge>
            <Badge key="issuer" variant="outline" className="text-xs">
              {t("form.steps.asset-admins.roles.issuer")}
            </Badge>
          </div>
        }
      />
      {assetAdmins.map((admin) => (
        admin.wallet && (
          <FormSummaryDetailItem
            key={admin.wallet}
            label={<EvmAddress address={admin.wallet} prettyNames />}
            value={
              <div className="flex flex-wrap gap-1">
                {admin.roles?.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {t(`form.steps.asset-admins.roles.${role}` as any)}
                  </Badge>
                ))}
              </div>
            }
          />
        )
      ))}
    </FormSummaryDetailCard>
  );
}