"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { User } from "@/lib/queries/user/user-schema";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { AdminRole } from "./admin-roles-badges";
import { SelectedAdminsList, type TokenAdmin } from "./selected-admins-list";

export function TokenAdmins({ userDetails }: { userDetails: User }) {
  const t = useTranslations("private.assets.create.form.steps.token-admins");
  const commonT = useTranslations("private.assets.details.forms.account");
  const form = useFormContext();
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Get current token admins from form state or initialize empty array
  const tokenAdmins = form.watch("tokenAdmins") || [];
  const selectedWallet = form.watch("selectedWallet");

  // Use useEffect to handle state updates when selectedWallet changes
  useEffect(() => {
    if (selectedWallet && !tokenAdmins.some((admin: TokenAdmin) => admin.wallet === selectedWallet)) {
      const updatedAdmins = [
        ...tokenAdmins,
        { wallet: selectedWallet, roles: ["admin"] as AdminRole[] }
      ];

      form.setValue("tokenAdmins", updatedAdmins, {
        shouldValidate: false,
        shouldDirty: true
      });
      // Validate only the tokenAdmins field
      form.trigger("tokenAdmins");

      // Reset the selector
      form.setValue("selectedWallet", "", {
        shouldValidate: false
      });

      setShowUserSelector(false);
    }
  }, [selectedWallet, tokenAdmins, form]);

  const handleRemoveAdmin = (wallet: string) => {
    const updatedAdmins = tokenAdmins.filter(
      (admin: TokenAdmin) => admin.wallet !== wallet
    );

    form.setValue("tokenAdmins", updatedAdmins, {
      shouldValidate: false,
      shouldDirty: true
    });
    // Validate only the tokenAdmins field
    form.trigger("tokenAdmins");
  };

  const handleChangeRoles = (wallet: string, roles: AdminRole[]) => {
    const updatedAdmins = tokenAdmins.map((admin: TokenAdmin) =>
      admin.wallet === wallet ? { ...admin, roles } : admin
    );

    form.setValue("tokenAdmins", updatedAdmins, {
      shouldValidate: false,
      shouldDirty: true
    });
    // Validate only the tokenAdmins field
    form.trigger("tokenAdmins");
  };

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="space-y-4">
        <SelectedAdminsList
          admins={tokenAdmins}
          onRemove={handleRemoveAdmin}
          onChangeRoles={handleChangeRoles}
          onAddAnother={() => setShowUserSelector(true)}
          userDetails={userDetails}
        />

        {(showUserSelector) && (
          <div className="space-y-1">
            {isManualEntry ? (
              <FormInput
                control={form.control}
                name="selectedWallet"
                placeholder={commonT("enter-wallet-address-placeholder")}
              />
            ) : (
              <FormUsers
                control={form.control}
                name="selectedWallet"
                placeholder={t("select-user-placeholder")}
                role="admin"
              />
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsManualEntry(!isManualEntry)}
                className="text-muted-foreground text-xs transition-colors hover:text-foreground"
              >
                {isManualEntry
                  ? commonT("search-user-instead")
                  : commonT("enter-user-address-manually")}
              </button>
            </div>
          </div>
        )}
      </div>
    </FormStep>
  );
}