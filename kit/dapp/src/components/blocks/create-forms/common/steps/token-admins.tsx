"use client";

import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { User } from "@/lib/queries/user/user-schema";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { type AdminRole, SelectedAdminsList, type TokenAdmin } from "./selected-admins-list";

export function TokenAdmins({ userDetails }: { userDetails: User }) {
  const t = useTranslations("private.assets.create.form.steps.token-admins");
  const commonT = useTranslations("private.assets.details.forms.account");
  const form = useFormContext();
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Get current token admins from form state or initialize empty array
  const tokenAdmins = form.watch("tokenAdmins") || [];
  const selectedWallet = form.watch("selectedWallet");

  // Watch for changes to selectedWallet and add as admin when selected
  if (selectedWallet && !tokenAdmins.some((admin: TokenAdmin) => admin.wallet === selectedWallet)) {
    const updatedAdmins = [
      ...tokenAdmins,
      { wallet: selectedWallet, roles: ["admin"] as AdminRole[] }
    ];

    form.setValue("tokenAdmins", updatedAdmins, {
      shouldValidate: true,
      shouldDirty: true
    });

    // Reset the selector
    form.setValue("selectedWallet", "", {
      shouldValidate: false
    });

    setShowUserSelector(false);
  }

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

  // Set the current user as the default token admin
  useEffect(() => {
    if (userDetails?.wallet && tokenAdmins.length === 0) {
      form.setValue(
        "tokenAdmins",
        [
          {
            wallet: userDetails.wallet,
            roles: ["admin", "mint", "burn", "pause", "transfer"] as AdminRole[]
          }
        ],
        {
          shouldValidate: true,
          shouldDirty: true
        }
      );
    }
  }, [userDetails?.wallet, form, tokenAdmins.length]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("title")}</h3>
      <p className="text-muted-foreground">{t("description")}</p>

      {tokenAdmins.length > 0 && (
        <SelectedAdminsList
          admins={tokenAdmins}
          onRemove={handleRemoveAdmin}
          onChangeRoles={handleChangeRoles}
          onAddAnother={() => setShowUserSelector(true)}
        />
      )}

      {(showUserSelector || tokenAdmins.length === 0) && (
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
  );
}