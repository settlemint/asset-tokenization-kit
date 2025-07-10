import type {
  StepDefinition,
  StepGroup,
} from "@/components/multistep-form/types";
import { RecoveryCodesStep } from "@/components/onboarding/steps/recovery-codes-step";
import { SystemBootstrapStep } from "@/components/onboarding/steps/system-bootstrap-step";
import { WalletDisplayStep } from "@/components/onboarding/steps/wallet-display-step";
import { WalletSecurityStep } from "@/components/onboarding/steps/wallet-security-step";
import { AssetSelectionComponent } from "@/components/onboarding/steps/asset-type-selection/asset-selection-component";
import { PlatformSettingsComponent } from "@/components/onboarding/steps/platform-settings-step";

import { useSettings } from "@/hooks/use-settings";
import type { SessionUser } from "@/lib/auth";
import {
  fiatCurrency,
  fiatCurrencyMetadata,
} from "@/lib/zod/validators/fiat-currency";
import { Info } from "lucide-react";
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
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  residenceCountry: z.string().optional(),
  investorType: z.enum(["retail", "professional", "institutional"]).optional(),
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
              user={user}
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
            user={user}
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
        title: "Enable platform addons",
        description: "Choose additional features and capabilities",
        groupId: "system",
        fields: [
          {
            name: "selectedAddons",
            label: "Platform Addons",
            type: "checkbox",
            description: "Select optional features to enhance your platform",
            options: [
              { label: "Airdrops", value: "airdrops" },
              { label: "Cross-chain Value Transfer (XVP)", value: "xvp" },
              { label: "Yield Farming", value: "yield" },
              { label: "Governance", value: "governance" },
              { label: "Analytics Dashboard", value: "analytics" },
            ],
          },
        ],
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
        component: ({ onNext, onPrevious, isFirstStep }) => (
          <div className="max-w-2xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Create your ONCHAINID
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your ONCHAINID is a unique blockchain identity that enables
                secure, compliant asset transactions. This identity will be
                linked to your wallet and verified through our compliance
                system.
              </p>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-primary">
                      Creating your ONCHAINID will deploy a smart contract
                      representing your identity on the blockchain. This is
                      required for all compliant asset transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              {!isFirstStep && (
                <button
                  onClick={onPrevious}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                >
                  Previous
                </button>
              )}
              <button
                onClick={onNext}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create ONCHAINID
              </button>
            </div>
          </div>
        ),
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
            name: "residenceCountry",
            label: "Country of Residence",
            type: "select",
            description: "Select your country of residence",
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
            name: "investorType",
            label: "Investor Type",
            type: "select",
            description: "Select your investor classification",
            options: [
              { label: "Retail Investor", value: "retail" },
              { label: "Professional Investor", value: "professional" },
              { label: "Institutional Investor", value: "institutional" },
            ],
          },
        ],
        validate: (data) => {
          const errors: string[] = [];
          if (!data.firstName?.trim()) errors.push("First name is required");
          if (!data.lastName?.trim()) errors.push("Last name is required");
          if (!data.dateOfBirth) errors.push("Date of birth is required");
          if (!data.nationality) errors.push("Nationality is required");
          if (!data.residenceCountry)
            errors.push("Country of residence is required");
          if (!data.investorType) errors.push("Investor type is required");
          return errors.length > 0 ? errors.join(", ") : undefined;
        },
      });
    }

    return dynamicSteps;
  }, [
    shouldShowWalletSteps,
    shouldShowSystemSetupSteps,
    shouldShowIdentitySteps,
    user,
    t,
  ]);

  const defaultValues: Partial<OnboardingFormData> = useMemo(
    () => ({
      walletGenerated: Boolean(user?.wallet),
      walletAddress: user?.wallet,
      walletSecured: false,
      systemBootstrapped: Boolean(systemAddress),
      systemAddress: systemAddress ?? undefined,
      baseCurrency: (currentBaseCurrency ??
        "USD") as OnboardingFormData["baseCurrency"],
      assetFactoriesDeployed: (systemDetails?.tokenFactories.length ?? 0) > 0,
      selectedAssetTypes: [],
      selectedAddons: [],
      kycCompleted: false,
      identityRegistered: false,
    }),
    [user, systemAddress, systemDetails, currentBaseCurrency]
  );

  return { groups, steps, defaultValues, onboardingSchema };
}
