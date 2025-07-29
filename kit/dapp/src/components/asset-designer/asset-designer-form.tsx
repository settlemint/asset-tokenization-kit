"use client";

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
import { waitForStream } from "@/lib/utils/stream";
import {
  getFactoryTypeIdFromAssetType,
  type AssetType,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import { FactoryList } from "@/orpc/routes/token/routes/factory/factory.list.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AssetDesignerFormProps {
  factories: FactoryList;
}

export const AssetDesignerForm = ({ factories }: AssetDesignerFormProps) => {
  const { t } = useTranslation(["asset-designer"]);
  const steps = useAssetDesignerSteps();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutateAsync: createToken } = useMutation(
    orpc.token.create.mutationOptions({
      mutationFn: async (values) => {
        return await orpc.token.create.call(values);
      },
      onSuccess: async (result, variables) => {
        await waitForStream(result, "token creation");

        const tokenFactory = getFactoryAddressFromTypeId(
          factories,
          variables.type
        );

        await Promise.all([
          // Invalidate factory list queries
          queryClient.invalidateQueries({
            queryKey: orpc.token.factoryList.queryOptions({
              input: { hasTokens: true },
            }).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.token.list.queryOptions({
              input: { tokenFactory },
            }).queryKey,
          }),
        ]);
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
      const factoryAddress = getFactoryAddressFromTypeId(
        factories,
        parsedValues.type
      );

      toast.promise(createToken(parsedValues), {
        loading: t("messages.creating", { type: parsedValues.type }),
        success: t("messages.created", { type: parsedValues.type }),
        error: (error: Error) =>
          `${t("messages.creation-failed", { type: parsedValues.type })}: ${error.message}`,
      });

      await navigate({
        to: "/token/$factoryAddress",
        params: { factoryAddress },
      });

      form.reset();
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
      <SelectAssetType
        form={form}
        onStepSubmit={incrementStep}
        factories={factories}
      />
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

function getFactoryAddressFromTypeId(
  factories: FactoryList,
  assetType: AssetType
) {
  const factoryTypeId = getFactoryTypeIdFromAssetType(assetType);
  const factory = factories.find((f) => f.typeId === factoryTypeId);

  if (!factory) {
    throw new Error(`Factory with typeId ${factoryTypeId} not found`);
  }
  return factory.id;
}
