"use client";

import { Form } from "@/components/blocks/form/form";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createDeposit } from "@/lib/mutations/deposit/create/create-action";
import { CreateDepositSchema } from "@/lib/mutations/deposit/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/deposit-factory/deposit-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/deposit-factory/deposit-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { AssetFormDefinition } from "../../asset-designer/types";
import { stepDefinition as adminsStep } from "../common/asset-admins/asset-admins";
import { stepDefinition as summaryStep } from "../common/summary/summary";
import { stepDefinition as regulationStep } from "../stablecoin/steps/regulation";
import { stepDefinition as basicsStep } from "./steps/basics";
import { stepDefinition as configurationStep } from "./steps/configuration";
import { DepositConfigurationCard } from "./steps/summaryConfigurationCard";

// Wrapper component for the regulation step to access form context
function RegulationStepWrapper({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const form = useFormContext();
  const RegulationComponent = regulationStep.component;

  return (
    <RegulationComponent
      assetType="deposit"
      form={form}
      onBack={onBack}
      onNext={onNext}
    />
  );
}

interface CreateDepositFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreateDepositForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateDepositFormProps) {
  const t = useTranslations("private.assets.create.form");
  const micaFlagFromPostHog = useFeatureFlagEnabled("mica");
  // Always enable MiCA in development mode, regardless of PostHog configuration
  const isMicaEnabled =
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined
      ? true
      : !!micaFlagFromPostHog;

  // Create component instances for each step
  const BasicsComponent = basicsStep.component;
  const ConfigurationComponent = configurationStep.component;
  const AdminsComponent = adminsStep.component;
  const SummaryComponent = summaryStep.component;

  // Create an array of all step components in order for Form to manage
  const allStepComponents = useMemo(() => {
    const baseSteps = [
      <BasicsComponent key="details" />,
      <ConfigurationComponent key="configuration" />,
      <AdminsComponent key="admins" userDetails={userDetails} />,
    ];

    // Only include regulation step if MICA is enabled
    if (isMicaEnabled) {
      baseSteps.push(
        <RegulationStepWrapper
          key="regulation"
          onBack={onPrevStep}
          onNext={onNextStep}
        />
      );
    }

    baseSteps.push(
      <SummaryComponent
        key="summary"
        configurationCard={<DepositConfigurationCard />}
        predictAddress={getPredictedAddress}
        isAddressAvailable={isAddressAvailable}
      />
    );

    return baseSteps;
  }, [userDetails, onPrevStep, onNextStep, isMicaEnabled]);

  // Define step order and mapping
  const stepIdToIndex = useMemo(() => {
    if (isMicaEnabled) {
      const steps: Record<string, number> = {
        details: 0,
        configuration: 1,
        admins: 2,
        regulation: 3,
        summary: 4,
      };
      return steps;
    } else {
      const steps: Record<string, number> = {
        details: 0,
        configuration: 1,
        admins: 2,
        summary: 3,
      };
      return steps;
    }
  }, [isMicaEnabled]);

  // Use the step synchronization hook
  const { isLastStep, onStepChange, onAnyFieldChange } = useFormStepSync({
    currentStepId,
    stepIdToIndex,
    onNextStep,
    onPrevStep,
  });

  // If MICA is disabled but the current step is regulation, redirect to summary
  useEffect(() => {
    if (!isMicaEnabled && currentStepId === "regulation") {
      onNextStep();
    }
  }, [isMicaEnabled, currentStepId, onNextStep]);

  return (
    <Form
      action={createDeposit}
      resolver={typeboxResolver(CreateDepositSchema())}
      defaultValues={{
        assetName: "",
        symbol: "",
        decimals: 18,
        collateralLivenessValue: 12,
        collateralLivenessTimeUnit: "months",
        price: {
          amount: 1,
          currency: userDetails.currency,
        },
        verificationType: "pincode",
        assetAdmins: [],
      }}
      buttonLabels={{
        label: isLastStep
          ? t("button-labels.deposit.issue")
          : t("button-labels.general.next"),
        submittingLabel: t("button-labels.deposit.submitting"),
        processingLabel: t("button-labels.general.processing"),
      }}
      secureForm={true}
      hideStepProgress={true}
      toast={{
        loading: t("toasts.deposit.submitting"),
        success: t("toasts.deposit.success"),
      }}
      onStepChange={onStepChange}
      onAnyFieldChange={onAnyFieldChange}
      onOpenChange={onOpenChange}
    >
      {allStepComponents}
    </Form>
  );
}

CreateDepositForm.displayName = "CreateDepositForm";

// Collect all the step definitions
const depositSteps = [
  basicsStep,
  configurationStep,
  adminsStep,
  regulationStep,
  summaryStep,
];

// Export form definition for the asset designer
export const depositFormDefinition: AssetFormDefinition = {
  steps: depositSteps,
  getStepComponent: (stepId: string) => {
    const step = depositSteps.find((s) => s.id === stepId);
    return step?.component || null;
  },
};
