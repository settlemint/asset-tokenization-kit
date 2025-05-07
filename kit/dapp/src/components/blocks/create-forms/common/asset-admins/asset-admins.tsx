"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { User } from "@/lib/queries/user/user-schema";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { AdminRole } from "./admin-roles-badges";
import { SelectedAdminsList, type AssetAdmin } from "./selected-admins-list";

export function AssetAdmins({ userDetails }: { userDetails: User }) {
  const t = useTranslations("private.assets.create.form.steps.asset-admins");
  const commonT = useTranslations("private.assets.details.forms.account");
  const form = useFormContext();
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  const watchedAssetAdmins = form.watch("assetAdmins");
  // Get current token admins from form state or initialize empty array
  const assetAdmins = useMemo(
    () => watchedAssetAdmins || [],
    [watchedAssetAdmins]
  );
  const selectedWallet = form.watch("selectedWallet");

  // Use useEffect to handle state updates when selectedWallet changes
  useEffect(() => {
    if (!selectedWallet) {
      return;
    }

    if (
      !assetAdmins.some((admin: AssetAdmin) => admin.wallet === selectedWallet)
    ) {
      const updatedAdmins = [
        ...assetAdmins,
        { wallet: selectedWallet, roles: ["admin"] as AdminRole[] },
      ];

      form.setValue("assetAdmins", updatedAdmins, {
        shouldValidate: false,
        shouldDirty: true,
      });

      // Validate only the assetAdmins field
      form.trigger("assetAdmins");

      // Reset the selector
      form.setValue("selectedWallet", "", {
        shouldValidate: false,
      });

      setShowUserSelector(false);
    }

    // Cleanup function to handle component unmount or selectedWallet changes
    return () => {
      if (selectedWallet) {
        form.setValue("selectedWallet", "", {
          shouldValidate: false,
        });
      }
    };
  }, [selectedWallet, assetAdmins, form, setShowUserSelector]);

  const handleRemoveAdmin = (wallet: string) => {
    const updatedAdmins = assetAdmins.filter(
      (admin: AssetAdmin) => admin.wallet !== wallet
    );

    form.setValue("assetAdmins", updatedAdmins, {
      shouldValidate: false,
      shouldDirty: true,
    });
    // Validate only the assetAdmins field
    form.trigger("assetAdmins");
  };

  const handleChangeRoles = (wallet: string, roles: AdminRole[]) => {
    const updatedAdmins = assetAdmins.map((admin: AssetAdmin) =>
      admin.wallet === wallet ? { ...admin, roles } : admin
    );

    form.setValue("assetAdmins", updatedAdmins, {
      shouldValidate: false,
      shouldDirty: true,
    });
    // Validate only the assetAdmins field
    form.trigger("assetAdmins");
  };

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="space-y-4">
        <SelectedAdminsList
          admins={assetAdmins}
          onRemove={handleRemoveAdmin}
          onChangeRoles={handleChangeRoles}
          onAddAnother={() => setShowUserSelector(true)}
          userDetails={userDetails}
        />

        {showUserSelector && (
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

// Define validatedFields for the AssetAdmins component
AssetAdmins.validatedFields = ["assetAdmins"];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "admins",
  title: "Asset Admins",
  description: "Assign administrators to this asset",
  component: AssetAdmins,
};
