import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { GrantRoleInput } from "@/lib/mutations/asset/access-control/grant-role/grant-role-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function AdminAddress() {
  const { control } = useFormContext<GrantRoleInput>();
  const [isManualEntry, setIsManualEntry] = useState(false);
  const t = useTranslations("private.assets.details.forms.account");

  return (
    <FormStep
      title={t("title.default")}
      description={t("description.grant-role")}
    >
      <div className="space-y-1">
        {isManualEntry ? (
          <FormInput
            control={control}
            name="userAddress"
            placeholder={t("enter-wallet-address-placeholder")}
          />
        ) : (
          <FormUsers
            control={control}
            name="userAddress"
            placeholder={t("search-user-placeholder")}
          />
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsManualEntry(!isManualEntry)}
            className="text-muted-foreground text-xs transition-colors hover:text-foreground"
          >
            {isManualEntry
              ? t("search-user-instead")
              : t("enter-user-address-manually")}
          </button>
        </div>
      </div>
    </FormStep>
  );
}

AdminAddress.validatedFields = [
  "userAddress",
] satisfies (keyof GrantRoleInput)[];
