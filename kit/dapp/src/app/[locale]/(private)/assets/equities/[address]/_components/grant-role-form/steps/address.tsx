import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { GrantRoleInput } from "@/lib/mutations/equity/grant-role/grant-role-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function AdminAddress() {
  const { control } = useFormContext<GrantRoleInput>();
  const [isManualEntry, setIsManualEntry] = useState(false);
  const t = useTranslations("admin.equities.grant-role-form.address");

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
      </div>

      <div className="space-y-1">
        {isManualEntry ? (
          <FormInput
            control={control}
            name="userAddress"
            label={t("address-label")}
            placeholder={t("manual-placeholder")}
          />
        ) : (
          <FormUsers
            control={control}
            name="userAddress"
            label={t("address-label")}
            placeholder={t("search-placeholder")}
            role="admin"
          />
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsManualEntry(!isManualEntry)}
            className="text-muted-foreground text-xs transition-colors hover:text-foreground"
          >
            {isManualEntry ? t("search-toggle") : t("manual-toggle")}
          </button>
        </div>
      </div>
    </div>
  );
}

AdminAddress.validatedFields = ["userAddress"] as const;
