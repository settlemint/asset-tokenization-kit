import { AssetRolePill } from "@/components/blocks/asset-role-pill/asset-role-pill";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { GrantRoleInput } from "@/lib/mutations/asset/access-control/grant-role/grant-role-schema";
import type { RoleMap } from "@/lib/utils/typebox/roles";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<GrantRoleInput>();
  const t = useTranslations("private.assets.details.forms.summary");
  const values = useWatch({
    control,
  });

  return (
    <FormStep
      title={t("title.grant-role")}
      description={t("description.grant-role")}
    >
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={address} />}
      />

      <FormSummaryDetailItem
        label={t("account-label.default")}
        value={
          values.userAddress ? <EvmAddress address={values.userAddress} /> : "-"
        }
      />

      <FormSummaryDetailItem
        label={t("roles-label")}
        value={<AssetRolePill roles={values.roles as RoleMap} />}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as (keyof GrantRoleInput)[];
