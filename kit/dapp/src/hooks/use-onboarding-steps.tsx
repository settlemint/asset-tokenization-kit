import type {
  StepDefinition,
  StepGroup,
} from "@/components/multistep-form/types";
import { AddPersonalInformationComponent } from "@/components/onboarding/steps/add-personal-information-step";
import { AssetSelectionComponent } from "@/components/onboarding/steps/asset-type-selection/asset-selection-component";
import { CreateOnchainIdComponent } from "@/components/onboarding/steps/create-onchainid-step";
import { FinishComponent } from "@/components/onboarding/steps/finish-step";
import { PlatformAddonsComponent } from "@/components/onboarding/steps/platform-addons-step";
import { PlatformSettingsComponent } from "@/components/onboarding/steps/platform-settings-step";
import { RecoveryCodesStep } from "@/components/onboarding/steps/recovery-codes-step";
import { SystemBootstrapStep } from "@/components/onboarding/steps/system-bootstrap-step";
import { WalletDisplayStep } from "@/components/onboarding/steps/wallet-display-step";
import { WalletSecurityStep } from "@/components/onboarding/steps/wallet-security-step";

import { useSettings } from "@/hooks/use-settings";
import type { SessionUser } from "@/lib/auth";
import {
  fiatCurrency,
  fiatCurrencyMetadata,
} from "@/lib/zod/validators/fiat-currency";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod/v4";

// Define the onboarding form schema
const onboardingSchema = z.object({
  walletGenerated: z.boolean().default(false),
  walletAddress: z.string().optional(),
  walletSecured: z.boolean().default(false),
  systemBootstrapped: z.boolean().default(false),
  systemAddress: z.string().optional(),
  baseCurrency: fiatCurrency().default("USD"),
  selectedAssetTypes: z
    .array(z.enum(["equity", "bond", "deposit", "fund", "stablecoin"]))
    .default([]),
  assetFactoriesDeployed: z.boolean().default(false),
  selectedAddons: z
    .array(z.enum(["airdrops", "xvp", "yield", "governance", "analytics"]))
    .default([]),
  addonsConfigured: z.boolean().default(false),
  kycCompleted: z.boolean().default(false),
  identityRegistered: z.boolean().default(false),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  residencyStatus: z
    .enum(["resident", "non-resident", "dual-resident", "unknown"])
    .optional(),
  nationalId: z.string().optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface UseOnboardingStepsParams {
  user: SessionUser | null | undefined;
  systemAddress: string | null;
  systemDetails: { tokenFactories: unknown[] } | null;
  shouldShowWalletSteps: boolean;
  shouldShowSystemSetupSteps: boolean;
  shouldShowIdentitySteps: boolean;
}

export function useOnboardingSteps({
  user,
  systemAddress,
  systemDetails,
  shouldShowWalletSteps,
  shouldShowSystemSetupSteps,
  shouldShowIdentitySteps,
}: UseOnboardingStepsParams) {
  const { t } = useTranslation(["onboarding", "general"]);

  // Get current base currency from settings
  const [currentBaseCurrency] = useSettings("BASE_CURRENCY");
  const groups: StepGroup[] = useMemo(() => {
    const dynamicGroups: StepGroup[] = [];

    if (shouldShowWalletSteps) {
      dynamicGroups.push({
        id: "wallet",
        title: t("wallet.title"),
        description: t("wallet.description"),
        collapsible: true,
        defaultExpanded: true,
      });
    }

    if (shouldShowSystemSetupSteps) {
      dynamicGroups.push({
        id: "system",
        title: t("system.title"),
        description: t("system.description"),
        collapsible: true,
        defaultExpanded: !shouldShowWalletSteps,
      });
    }

    if (shouldShowIdentitySteps) {
      dynamicGroups.push({
        id: "identity",
        title: t("steps.identity.title"),
        description: t("steps.identity.description"),
        collapsible: true,
        defaultExpanded: dynamicGroups.length === 0,
      });
    }

    return dynamicGroups;
  }, [
    shouldShowWalletSteps,
    shouldShowSystemSetupSteps,
    shouldShowIdentitySteps,
    t,
  ]);

  const steps: StepDefinition<OnboardingFormData>[] = useMemo(() => {
    const dynamicSteps: StepDefinition<OnboardingFormData>[] = [];

    if (shouldShowWalletSteps) {
      dynamicSteps.push(
        {
          id: "wallet-creation",
          title: t("steps.wallet.title"),
          description: t("steps.wallet.description"),
          groupId: "wallet",
          fields: [],
          onStepComplete: async () => Promise.resolve(),
          component: ({
            form,
            stepId,
            onNext,
            onPrevious,
            isFirstStep,
            isLastStep,
          }) => (
            <WalletDisplayStep
              form={form}
              stepId={stepId}
              onNext={onNext}
              onPrevious={onPrevious}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              user={user ?? undefined}
            />
          ),
        },
        {
          id: "wallet-security",
          title: t("steps.security.title"),
          description: t("steps.security.description"),
          groupId: "wallet",
          fields: [],
          onStepComplete: async () => Promise.resolve(),
          component: ({ onNext, onPrevious, isFirstStep, isLastStep }) => {
            // In the onboarding flow, always show the selection screen first
            // This allows users to review and modify their security settings
            // They can click Continue if they're happy with existing security
            const forceShowSelection = true;

            return (
              <WalletSecurityStep
                onNext={onNext}
                onPrevious={onPrevious}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                user={user}
                forceShowSelection={forceShowSelection}
              />
            );
          },
        },
        {
          id: "recovery-codes",
          title: "Recovery Codes",
          description: "Save your wallet recovery codes",
          groupId: "wallet",
          fields: [],
          onStepComplete: async () => Promise.resolve(),
          component: ({ onNext, onPrevious, isFirstStep, isLastStep }) => (
            <RecoveryCodesStep
              onNext={onNext}
              onPrevious={onPrevious}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              user={user}
            />
          ),
        }
      );
    }

    if (shouldShowSystemSetupSteps) {
      // 1. Deploy core system
      dynamicSteps.push({
        id: "system-bootstrap",
        title: t("steps.system.title"),
        description: t("steps.system.description"),
        groupId: "system",
        fields: [],
        onStepComplete: async () => Promise.resolve(),
        component: ({ onNext, onPrevious, isFirstStep, isLastStep }) => (
          <SystemBootstrapStep
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            user={user ?? undefined}
          />
        ),
      });

      // 2. Configure platform settings
      dynamicSteps.push({
        id: "configure-platform-settings",
        title: t("platform.title"),
        description: t("platform.description"),
        groupId: "system",
        fields: [
          {
            name: "baseCurrency",
            label: "Base Currency",
            type: "select",
            description: "Choose the default currency for your platform",
            options: Object.entries(fiatCurrencyMetadata).map(
              ([code, metadata]) => ({
                label: `${metadata.name} (${code})`,
                value: code,
              })
            ),
          },
        ],
        component: (props) => <PlatformSettingsComponent {...props} />,
      });

      // 3. Select supported assets
      dynamicSteps.push({
        id: "asset-selection",
        title: t("steps.assets.title"),
        description: t("steps.assets.description"),
        groupId: "system",
        fields: [
          {
            name: "selectedAssetTypes",
            label: t("assets.select-label"),
            type: "checkbox",
            description: t("assets.select-description"),
            options: [
              { label: "Equity Tokens", value: "equity" },
              { label: "Bond Tokens", value: "bond" },
              { label: "Deposit Tokens", value: "deposit" },
              { label: "Fund Tokens", value: "fund" },
              { label: "Stablecoins", value: "stablecoin" },
            ],
          },
        ],
        validate: (data) =>
          !data.selectedAssetTypes?.length
            ? "At least one asset type must be selected"
            : undefined,
        component: (props) => <AssetSelectionComponent {...props} />,
      });

      // 4. Enable platform addons
      dynamicSteps.push({
        id: "enable-platform-addons",
        title: "Configure Platform Add-ons",
        description: "Enhance your platform with optional features",
        groupId: "system",
        fields: [
          {
            name: "selectedAddons",
            label: "Platform Add-ons",
            type: "checkbox",
            description: "Select optional features to enhance your platform",
            options: [
              { label: "Airdrops", value: "airdrops" },
              { label: "Fixed Yield", value: "yield" },
              { label: "XVP", value: "xvp" },
            ],
          },
        ],
        component: (props) => <PlatformAddonsComponent {...props} />,
      });
    }

    if (shouldShowIdentitySteps) {
      // 1. Create your ONCHAINID
      dynamicSteps.push({
        id: "create-onchainid",
        title: "Create your ONCHAINID",
        description: "Generate your blockchain identity for compliance",
        groupId: "identity",
        fields: [],
        onStepComplete: async () => Promise.resolve(),
        component: (props) => <CreateOnchainIdComponent {...props} />,
      });

      // 2. Add personal information
      dynamicSteps.push({
        id: "add-personal-information",
        title: "Add personal information",
        description: "Provide KYC information for compliance verification",
        groupId: "identity",
        fields: [
          {
            name: "firstName",
            label: "First Name",
            type: "text",
            description: "Enter your legal first name",
          },
          {
            name: "lastName",
            label: "Last Name",
            type: "text",
            description: "Enter your legal last name",
          },
          {
            name: "email",
            label: "Email",
            type: "text",
            description: "Enter your email address",
          },
          {
            name: "dateOfBirth",
            label: "Date of Birth",
            type: "text",
            description: "Enter your date of birth",
          },
          {
            name: "nationality",
            label: "Nationality",
            type: "select",
            description: "Select your nationality",
            options: [
              { label: "United States", value: "US" },
              { label: "United Kingdom", value: "GB" },
              { label: "Germany", value: "DE" },
              { label: "France", value: "FR" },
              { label: "Japan", value: "JP" },
              { label: "Canada", value: "CA" },
              { label: "Australia", value: "AU" },
              { label: "Other", value: "OTHER" },
            ],
          },
          {
            name: "residencyStatus",
            label: "Residency Status",
            type: "select",
            description: "Select your residency status",
            options: [
              { label: "Resident", value: "resident" },
              { label: "Non-Resident", value: "non-resident" },
              { label: "Dual-Resident", value: "dual-resident" },
              { label: "Unknown", value: "unknown" },
            ],
          },
          {
            name: "nationalId",
            label: "National ID (optional)",
            type: "text",
            description: "Enter your national identification number (optional)",
          },
        ],
        validate: (data) => {
          const errors: string[] = [];
          if (!data.firstName?.trim()) errors.push("First name is required");
          if (!data.lastName?.trim()) errors.push("Last name is required");
          if (!data.email?.trim()) errors.push("Email is required");
          if (!data.dateOfBirth) errors.push("Date of birth is required");
          if (!data.nationality) errors.push("Nationality is required");
          if (!data.residencyStatus)
            errors.push("Residency status is required");
          // nationalId is now optional - no validation required
          return errors.length > 0 ? errors.join(", ") : undefined;
        },
        component: (props) => <AddPersonalInformationComponent {...props} />,
      });

      // 3. Finish onboarding
      dynamicSteps.push({
        id: "finish",
        title: "Finish",
        description: "Review and confirm your onboarding details",
        groupId: "identity",
        fields: [],
        onStepComplete: async () => Promise.resolve(),
        component: (props) => <FinishComponent {...props} />,
      });
    }

    return dynamicSteps;
  }, [
    shouldShowWalletSteps,
    shouldShowSystemSetupSteps,
    shouldShowIdentitySteps,
    user,
    t,
    systemDetails,
  ]);

  const defaultValues: Partial<OnboardingFormData> = useMemo(() => {
    // Map deployed factories to their corresponding asset types
    const deployedAssetTypes: OnboardingFormData["selectedAssetTypes"] = [];

    if (systemDetails?.tokenFactories) {
      for (const factory of systemDetails.tokenFactories) {
        // Since factory is unknown, we need to safely check if it has a typeId
        if (factory && typeof factory === "object" && "typeId" in factory) {
          const typeId = String(
            (factory as { typeId: string }).typeId
          ).toLowerCase();
          // Map the factory typeId to the asset type
          if (typeId.includes("bond")) deployedAssetTypes.push("bond");
          else if (typeId.includes("equity")) deployedAssetTypes.push("equity");
          else if (typeId.includes("deposit"))
            deployedAssetTypes.push("deposit");
          else if (typeId.includes("fund")) deployedAssetTypes.push("fund");
          else if (typeId.includes("stablecoin"))
            deployedAssetTypes.push("stablecoin");
        }
      }
    }

    return {
      walletGenerated: Boolean(user?.wallet),
      walletAddress: user?.wallet,
      walletSecured: false,
      systemBootstrapped: Boolean(systemAddress),
      systemAddress: systemAddress ?? undefined,
      baseCurrency: (currentBaseCurrency ??
        "USD") as OnboardingFormData["baseCurrency"],
      assetFactoriesDeployed: (systemDetails?.tokenFactories.length ?? 0) > 0,
      selectedAssetTypes: deployedAssetTypes,
      selectedAddons: [],
      kycCompleted: false,
      identityRegistered: false,
    };
  }, [user, systemAddress, systemDetails, currentBaseCurrency]);

  return { groups, steps, defaultValues, onboardingSchema };
}
