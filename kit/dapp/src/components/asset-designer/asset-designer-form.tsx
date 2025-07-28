import { AssetBasics } from "@/components/asset-designer/asset-basics/asset";
import { ComplianceModules } from "@/components/asset-designer/compliance-modules/compliance-modules";
import { SelectAssetType } from "@/components/asset-designer/select-asset-type";
import {
  assetDesignerFormOptions,
  AssetDesignerFormSchema,
} from "@/components/asset-designer/shared-form";
import {
  useAssetDesignerSteps,
  type AssetDesignerStepsType,
} from "@/components/asset-designer/steps";
import { Summary } from "@/components/asset-designer/summary/summary";
import { StepLayout } from "@/components/stepper/step-layout";
import { getNextStep, getStepById } from "@/components/stepper/utils";
import { useAppForm } from "@/hooks/use-app-form";
import { waitForStream } from "@/lib/utils/mutation";
import { orpc } from "@/orpc/orpc-client";
import { useMutation } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

export const AssetDesignerForm = () => {
  const { t } = useTranslation(["asset-designer"]);
  const steps = useAssetDesignerSteps();
  const { mutateAsync: createToken } = useMutation(
    orpc.token.create.mutationOptions({
      mutationFn: async (values) => {
        return await orpc.token.create.call(values);
      },
      onSuccess: async (result) => {
        await waitForStream(result, "token creation");
        form.reset();
      },
    })
  );

  const form = useAppForm({
    ...assetDesignerFormOptions,
    validators: {
      onChange: AssetDesignerFormSchema,
    },
    onSubmit: async (values) => {
      const parsedValues = AssetDesignerFormSchema.parse(values.value);
      await createToken({
        ...parsedValues,
        initialModulePairs: [],
      });
    },
  });

  const stepId = useStore(form.store, (state) => state.values.step);
  const currentStep = getStepById(steps, stepId);
  const incrementStep = () => {
    const nextStep = getNextStep(steps, currentStep);
    form.setFieldValue("step", nextStep.id);
  };

  const stepComponent: Record<AssetDesignerStepsType, JSX.Element> = {
    selectAssetType: (
      <SelectAssetType form={form} onStepSubmit={incrementStep} />
    ),
    assetBasics: <AssetBasics form={form} onStepSubmit={incrementStep} />,
    complianceModules: (
      <ComplianceModules form={form} onStepSubmit={incrementStep} />
    ),
    summary: (
      <Summary
        form={form}
        onSubmit={async () => {
          await form.handleSubmit();
        }}
      />
    ),
  };

  return (
    <form.AppForm>
      <StepLayout
        title={t("wizard.title")}
        description={t("wizard.description")}
        stepsOrGroups={steps}
        currentStep={currentStep}
        onStepSelect={(step) => {
          form.setFieldValue("step", step.id);
        }}
        navigationMode="next-and-completed"
      >
        {({ currentStep }) => {
          return stepComponent[currentStep.id];
        }}
      </StepLayout>
    </form.AppForm>
  );
};
