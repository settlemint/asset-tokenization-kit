import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Address } from "viem";

interface TokenAdmin {
  wallet?: Address;
  roles?: ("admin" | "user-manager" | "issuer")[];
}

interface TokenAdminsCardProps {
  userDetails: {
    wallet: Address;
  };
  tokenAdmins?: TokenAdmin[];
}

export function TokenAdminsCard({ userDetails, tokenAdmins }: TokenAdminsCardProps) {
  const t = useTranslations("private.assets.create");

  if (!tokenAdmins) {
    return null;
  }

  return (
    <FormSummaryDetailCard
      title={t("summary.token-admins-title")}
      description={t("summary.token-admins-description")}
      icon={<Users className="size-3 text-primary-foreground" />}
    >
      <FormSummaryDetailItem
        key={userDetails.wallet}
        label={<EvmAddress address={userDetails.wallet} prettyNames />}
        value={
          <div className="flex flex-wrap gap-1">
            <Badge key="admin" variant="outline" className="text-xs">
              {t("form.steps.token-admins.roles.admin")}
            </Badge>
            <Badge key="user-manager" variant="outline" className="text-xs">
              {t("form.steps.token-admins.roles.user-manager")}
            </Badge>
            <Badge key="issuer" variant="outline" className="text-xs">
              {t("form.steps.token-admins.roles.issuer")}
            </Badge>
          </div>
        }
      />
      {tokenAdmins.map((admin) => (
        admin.wallet && (
          <FormSummaryDetailItem
            key={admin.wallet}
            label={<EvmAddress address={admin.wallet} prettyNames />}
            value={
              <div className="flex flex-wrap gap-1">
                {admin.roles?.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {t(`form.steps.token-admins.roles.${role}` as any)}
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