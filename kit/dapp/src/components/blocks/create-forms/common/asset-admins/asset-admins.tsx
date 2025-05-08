"use client";

import { StepContent } from "@/components/blocks/asset-designer/step-wizard/step-content";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { User } from "@/lib/queries/user/user-schema";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { AdminRole } from "./admin-roles-badges";
import { SelectedAdminsList, type AssetAdmin } from "./selected-admins-list";

interface AssetAdminsProps {
  userDetails: User;
  onNext?: () => void;
  onBack?: () => void;
}

export function AssetAdmins({ userDetails, onNext, onBack }: AssetAdminsProps) {
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

  // Handle next button click - trigger validation before proceeding
  const handleNext = async () => {
    // Trigger validation for assetAdmins field
    const isValid = await form.trigger("assetAdmins");
    if (isValid && onNext) {
      onNext();
    }
  };

  // Check if there are errors in the assetAdmins field
  const hasStepErrors = !!form.formState.errors.assetAdmins;

  return (
    <StepContent
      onNext={handleNext}
      onBack={onBack}
      isNextDisabled={hasStepErrors}
      showBackButton={!!onBack}
    >
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">{t("title")}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>

        <FormStep title={t("title")} description={t("description")}>
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
      </div>
    </StepContent>
  );
}

// Define validatedFields for the AssetAdmins component
AssetAdmins.validatedFields = ["assetAdmins"];

// Export step definition for the asset designer
export const stepDefinition = {
  id: "admins",
  title: "form.steps.asset-admins.title",
  description: "form.steps.asset-admins.description",
  component: AssetAdmins,
};
