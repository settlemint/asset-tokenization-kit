"use client";

import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import { FormField, FormItem } from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { AdminRole, SelectedAdminsList, TokenAdmin } from "./selected-admins-list";

export function TokenAdmins() {
  const t = useTranslations("private.assets.create.form.steps.token-admins");
  const form = useFormContext();
  const [showUserSelector, setShowUserSelector] = useState(false);

  // Get current token admins from form state or initialize empty array
  const tokenAdmins = form.watch("tokenAdmins") || [];

  const handleAddAdmin = (wallet: string) => {
    // Check if the admin already exists
    if (tokenAdmins.some((admin: TokenAdmin) => admin.wallet === wallet)) {
      return;
    }

    // Add the new admin with default roles
    const updatedAdmins = [
      ...tokenAdmins,
      { wallet, roles: ["admin"] as AdminRole[] }
    ];

    form.setValue("tokenAdmins", updatedAdmins, {
      shouldValidate: true,
      shouldDirty: true
    });

    setShowUserSelector(false);
  };

  const handleRemoveAdmin = (wallet: string) => {
    const updatedAdmins = tokenAdmins.filter(
      (admin: TokenAdmin) => admin.wallet !== wallet
    );

    form.setValue("tokenAdmins", updatedAdmins, {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  const handleChangeRoles = (wallet: string, roles: AdminRole[]) => {
    const updatedAdmins = tokenAdmins.map((admin: TokenAdmin) =>
      admin.wallet === wallet ? { ...admin, roles } : admin
    );

    form.setValue("tokenAdmins", updatedAdmins, {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("title")}</h3>
      <p className="text-muted-foreground">{t("description")}</p>

      <FormField
        control={form.control}
        name="tokenAdmins"
        render={() => (
          <FormItem>
            {tokenAdmins.length > 0 && (
              <SelectedAdminsList
                admins={tokenAdmins}
                onRemove={handleRemoveAdmin}
                onChangeRoles={handleChangeRoles}
                onAddAnother={() => setShowUserSelector(true)}
              />
            )}

            {(showUserSelector || tokenAdmins.length === 0) && (
              <FormUsers
                control={form.control}
                name="_tempAdminSelector"
                label={tokenAdmins.length === 0 ? t("add-first-admin") : t("add-another-admin")}
                placeholder={t("select-user-placeholder")}
                onChange={handleAddAdmin}
              />
            )}
          </FormItem>
        )}
      />
    </div>
  );
}