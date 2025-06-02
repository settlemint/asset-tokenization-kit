"use client";

/*
 * Architectural Note: Form-Managed Steps with Parent Coordination
 *
 * This component uses a hybrid approach to step management:
 *
 * 1. The Form component manages step state internally, with all validation
 *    and verification logic working properly for each step.
 *
 * 2. We pass ALL step components to the Form to enable its built-in
 *    multi-step features, including proper validation and pincode verification.
 *
 * 3. We use the onStepChange callback to notify the parent (AssetDesignerDialog)
 *    when the Form's step changes, allowing the sidebar and other external
 *    UI elements to stay in sync.
 *
 * 4. When we receive the currentStepId from the parent, we update the Form's
 *    internal step state to keep them synchronized.
 *
 * This approach gives us the best of both worlds: Form's validation and
 * security features work correctly while the parent maintains control over
 * the overall process flow.
 */

import { Form } from "@/components/blocks/form/form";
import { useFeatureEnabled } from "@/lib/hooks/use-feature-enabled";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import { CreateStablecoinSchema } from "@/lib/mutations/stablecoin/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/stablecoin-factory/stablecoin-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/stablecoin-factory/stablecoin-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
import type { FiatCurrency } from "@/lib/utils/typebox/fiat-currency";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { AssetFormDefinition } from "../../asset-designer/types";
import { stepDefinition as adminsStep } from "../common/asset-admins/asset-admins";
import { stepDefinition as summaryStep } from "../common/summary/summary";
import { stepDefinition as basicsStep } from "./steps/basics";
import { stepDefinition as configurationStep } from "./steps/configuration";
import { stepDefinition as regulationStep } from "./steps/regulation";
import { StablecoinConfigurationCard } from "./steps/summaryConfigurationCard";

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
      assetType="stablecoin"
      form={form}
      onBack={onBack}
      onNext={onNext}
    />
  );
}

interface CreateStablecoinFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreateStablecoinForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateStablecoinFormProps) {
  const t = useTranslations("private.assets.create.form");
  const isMicaEnabled = useFeatureEnabled("mica");

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
        configurationCard={<StablecoinConfigurationCard />}
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
      action={createStablecoin}
      resolver={typeboxResolver(CreateStablecoinSchema())}
      defaultValues={{
        assetName: "",
        symbol: "",
        decimals: 18,
        collateralLivenessValue: 12,
        collateralLivenessTimeUnit: "months",
        price: {
          amount: 1,
          currency: userDetails.currency as FiatCurrency,
        },
        verificationType: "pincode",
        assetAdmins: [],
      }}
      buttonLabels={{
        label: isLastStep
          ? t("button-labels.stablecoin.issue")
          : t("button-labels.general.next"),
        submittingLabel: t("button-labels.stablecoin.submitting"),
        processingLabel: t("button-labels.general.processing"),
      }}
      secureForm={true}
      hideStepProgress={true}
      toast={{
        loading: t("toasts.stablecoin.submitting"),
        success: t("toasts.stablecoin.success"),
      }}
      currentStep={
        stepIdToIndex[currentStepId as keyof typeof stepIdToIndex] ?? 0
      }
      onStepChange={onStepChange}
      onAnyFieldChange={onAnyFieldChange}
      onOpenChange={onOpenChange}
    >
      {allStepComponents}
    </Form>
  );
}

CreateStablecoinForm.displayName = "CreateStablecoinForm";

// Collect all the step definitions
const stablecoinSteps = [
  basicsStep,
  configurationStep,
  adminsStep,
  regulationStep,
  summaryStep,
];

// Export form definition for the asset designer
export const stablecoinFormDefinition: AssetFormDefinition = {
  steps: stablecoinSteps,
  getStepComponent: (stepId: string) => {
    const step = stablecoinSteps.find((s) => s.id === stepId);
    return step?.component || null;
  },
};
