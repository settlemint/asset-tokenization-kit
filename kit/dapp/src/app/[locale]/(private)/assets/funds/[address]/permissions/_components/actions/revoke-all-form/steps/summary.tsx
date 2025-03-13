import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormOtp } from "@/components/blocks/form/inputs/form-otp";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { FormSummarySecurityConfirmation } from "@/components/blocks/form/summary/security-confirmation";
import { type Role, getRoleDisplayName } from "@/lib/config/roles";
import type { UpdateRolesInput } from "@/lib/mutations/fund/update-roles/update-roles-schema";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

export function Summary({
  userAddress,
  currentRoles: roles,
}: {
  userAddress: Address;
  currentRoles: Role[];
}) {
  const { control } = useFormContext<UpdateRolesInput>();
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
          value={
            <div className="flex flex-wrap gap-1">
              {roles.map((role: Role) => (
                <span key={role} className="rounded bg-muted px-2 py-1 text-xs">
                  {getRoleDisplayName(role)}
                </span>
              ))}
            </div>
          }
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ["pincode"] as const;
