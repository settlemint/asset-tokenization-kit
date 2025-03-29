"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { AddAdminFormType } from "@/lib/mutations/admin/add-admin-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Admin() {
  const { control } = useFormContext<AddAdminFormType>();
  const t = useTranslations("admin.platform.settings");

  return (
    <FormStep
      title={t("add-admin.title")}
      description={t("add-admin.description")}
    >
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="address"
          label={t("add-admin.wallet-address-label")}
          placeholder="0x0000000000000000000000000000000000000000"
        />
        <FormInput
          control={control}
          name="firstName"
          label={t("add-admin.first-name-label")}
          placeholder="John"
        />
        <FormInput
          control={control}
          name="lastName"
          label={t("add-admin.last-name-label")}
          placeholder="Doe"
        />
      </div>
    </FormStep>
  );
}

Admin.validatedFields = [
  "address",
  "firstName",
  "lastName",
] satisfies (keyof AddAdminFormType)[];
