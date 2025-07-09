import type {
  StepDefinition,
  StepGroup,
} from "@/components/multistep-form/types";
import { RecoveryCodesStep } from "@/components/onboarding/steps/recovery-codes-step";
import { SystemBootstrapStep } from "@/components/onboarding/steps/system-bootstrap-step";
import { WalletDisplayStep } from "@/components/onboarding/steps/wallet-display-step";
import { WalletSecurityStep } from "@/components/onboarding/steps/wallet-security-step";

import { useMemo } from "react";
import { z } from "zod/v4";

// Define the onboarding form schema
const onboardingSchema = z.object({
  walletGenerated: z.boolean().default(false),
  walletAddress: z.string().optional(),
  walletSecured: z.boolean().default(false),
  systemBootstrapped: z.boolean().default(false),
  systemAddress: z.string().optional(),
  baseCurrency: z.string().default("USD"),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
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
  const groups: StepGroup[] = useMemo(() => {
    const dynamicGroups: StepGroup[] = [];

    if (shouldShowWalletSteps) {
      dynamicGroups.push({
        id: "wallet",
        title: "Wallet Setup",
        description: "Create and secure your wallet",
        collapsible: true,
        defaultExpanded: true,
      });
    }

    if (shouldShowSystemSetupSteps) {
      dynamicGroups.push({
        id: "system",
        title: "System Setup",
        description: "Initialize blockchain and configure assets",
        collapsible: true,
        defaultExpanded: !shouldShowWalletSteps,
      });
    }

    if (shouldShowIdentitySteps) {
      dynamicGroups.push({
        id: "identity",
        title: "Identity Setup",
        description: "Complete KYC and register identity",
        collapsible: true,
        defaultExpanded: dynamicGroups.length === 0,
      });
    }

    return dynamicGroups;
  }, [
    shouldShowWalletSteps,
    shouldShowSystemSetupSteps,
    shouldShowIdentitySteps,
  ]);

  const steps: StepDefinition<OnboardingFormData>[] = useMemo(() => {
    const dynamicSteps: StepDefinition<OnboardingFormData>[] = [];

    if (shouldShowWalletSteps) {
      dynamicSteps.push(
        {
          id: "wallet-creation",
          title: "Create Your Wallet",
          description: "Generate a secure wallet for all blockchain operations",
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
          title: "Secure Your Wallet",
          description: "Set up security verification for all operations",
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
      if (!systemAddress) {
        dynamicSteps.push({
          id: "system-bootstrap",
          title: "Bootstrap System",
          description: "Initialize the blockchain system and set base currency",
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
      }

      // Add asset and addon selection steps with simplified inline definitions
      dynamicSteps.push({
        id: "asset-selection",
        title: "Select Assets",
        description: "Choose which asset types your platform will support",
        groupId: "system",
        fields: [
          {
            name: "selectedAssetTypes",
            label: "Asset Types",
            type: "checkbox",
            description:
              "Which assets do you want to support? At least one is required.",
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
      });
    }

    return dynamicSteps;
  }, [shouldShowWalletSteps, shouldShowSystemSetupSteps, systemAddress, user]);

  const defaultValues: Partial<OnboardingFormData> = useMemo(
    () => ({
      walletGenerated: Boolean(user?.wallet),
      walletAddress: user?.wallet,
      walletSecured: false,
      systemBootstrapped: Boolean(systemAddress),
      systemAddress: systemAddress ?? undefined,
      assetFactoriesDeployed: (systemDetails?.tokenFactories.length ?? 0) > 0,
      selectedAssetTypes: [],
      selectedAddons: [],
      kycCompleted: false,
      identityRegistered: false,
    }),
    [user, systemAddress, systemDetails]
  );

  return { groups, steps, defaultValues, onboardingSchema };
}
