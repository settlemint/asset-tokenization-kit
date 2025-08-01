import { AssetBasics } from "@/components/asset-designer/asset-designer-wizard/asset-basics/asset";
import { SelectComplianceModules } from "@/components/asset-designer/asset-designer-wizard/compliance-modules/select-compliance-modules";
import {
  assetDesignerFormOptions,
  AssetDesignerFormSchema,
} from "@/components/asset-designer/asset-designer-wizard/shared-form";
import {
  useAssetDesignerSteps,
  type AssetDesignerStepsType,
} from "@/components/asset-designer/asset-designer-wizard/steps";
import { Summary } from "@/components/asset-designer/asset-designer-wizard/summary/summary";
import { StepLayout } from "@/components/stepper/step-layout";
import { getNextStep, getStepById } from "@/components/stepper/utils";
import { useAppForm } from "@/hooks/use-app-form";
import {
  getFactoryTypeIdFromAssetType,
  type AssetType,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import { FactoryList } from "@/orpc/routes/token/routes/factory/factory.list.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
interface AssetDesignerFormProps {
  type: AssetType;
}

export const AssetDesignerWizard = ({ type }: AssetDesignerFormProps) => {
  const { factories, complianceModules } = useRouteContext({
    from: "/_private/_onboarded/asset-designer/",
  });
  const { t } = useTranslation(["asset-designer"]);
  const steps = useAssetDesignerSteps();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutateAsync: createToken } = useMutation(
    orpc.token.create.mutationOptions({
      onSuccess: async (_result, variables) => {
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
        success: (data) =>
          t("messages.created", {
            type: parsedValues.type,
            defaultValue: `${parsedValues.type} token '${data.name} (${data.symbol})' created successfully`,
            name: data.name,
            symbol: data.symbol,
          }),
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
    assetBasics: <AssetBasics form={form} onStepSubmit={incrementStep} />,
    complianceModules: (
      <SelectComplianceModules
        form={form}
        onStepSubmit={incrementStep}
        complianceModules={complianceModules}
      />
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
      <form.Field name="type" defaultValue={type}>
        {(field) => (
          <input
            type="hidden"
            name={field.name}
            value={field.state.value}
            readOnly
          />
        )}
      </form.Field>

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
