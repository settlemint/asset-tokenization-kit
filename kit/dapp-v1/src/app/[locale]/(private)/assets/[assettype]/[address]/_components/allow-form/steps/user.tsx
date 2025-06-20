import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { AllowUserInput } from "@/lib/mutations/allow-user/allow-user-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function User() {
  const { control } = useFormContext<AllowUserInput>();
  const [isManualEntry, setIsManualEntry] = useState(false);
  const t = useTranslations("private.assets.details.forms.account");

  return (
    <FormStep title={t("title.default")} description={t("description.allow")}>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          {isManualEntry ? (
            <FormInput
              control={control}
              name="userAddress"
              placeholder="0x0000000000000000000000000000000000000000"
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
      </div>
    </FormStep>
  );
}

User.validatedFields = ["userAddress"] satisfies (keyof AllowUserInput)[];
