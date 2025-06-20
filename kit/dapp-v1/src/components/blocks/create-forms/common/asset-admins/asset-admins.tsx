"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import type { User } from "@/lib/queries/user/user-schema";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { AdminRole } from "./admin-roles-badges";
import { SelectedAdminsList, type AssetAdmin } from "./selected-admins-list";

interface AssetAdminsProps {
  userDetails: User;
}

export function AssetAdmins({ userDetails }: AssetAdminsProps) {
  const t = useTranslations("private.assets");

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
    <StepContent>
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">
            {t("create.form.steps.asset-admins.title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t("create.form.steps.asset-admins.description")}
          </p>
        </div>

        <FormStep
          title={t("create.form.steps.asset-admins.title")}
          description={t("create.form.steps.asset-admins.description")}
          className="w-full"
          contentClassName="w-full"
        >
          <div className="space-y-4">
            <SelectedAdminsList
              userDetails={userDetails}
              admins={assetAdmins}
              onRemove={handleRemoveAdmin}
              onChangeRoles={handleChangeRoles}
              onAddAnother={() => setShowUserSelector(true)}
            />

            {showUserSelector && (
              <div className="space-y-1">
                {isManualEntry ? (
                  <FormInput
                    control={form.control}
                    name="selectedWallet"
                    placeholder={t(
                      "details.forms.account.enter-wallet-address-placeholder"
                    )}
                  />
                ) : (
                  <FormUsers
                    control={form.control}
                    name="selectedWallet"
                    placeholder={t(
                      "create.form.steps.asset-admins.select-user-placeholder"
                    )}
                  />
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsManualEntry(!isManualEntry)}
                    className="text-muted-foreground text-xs transition-colors hover:text-foreground"
                  >
                    {isManualEntry
                      ? t("details.forms.account.search-user-instead")
                      : t("details.forms.account.enter-user-address-manually")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </FormStep>
      </div>
    </StepContent>
  );
}

export const stepDefinition = {
  id: "admins",
  title: "form.steps.asset-admins.title",
  description: "form.steps.asset-admins.description",
  component: AssetAdmins,
} as const;
