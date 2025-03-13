import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { Role } from "@/lib/config/roles";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { AssetRolePill } from "../../asset-role-pill/asset-role-pill";

export function Summary({
  userAddress,
  currentRoles: roles,
}: {
  userAddress: Address;
  currentRoles: Role[];
}) {
  const t = useTranslations(
    "admin.asset-permissions-tab.revoke-all-form.summary"
  );

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailCard
        title={t("revoke-title")}
        description={t("operation-description")}
        icon={<Lock className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("user-label")}
          value={<EvmAddress address={userAddress} />}
        />
        <FormSummaryDetailItem
          label={t("roles-to-revoke-label")}
          value={<AssetRolePill roles={roles} />}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
