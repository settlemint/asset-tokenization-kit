import { AssetBasics } from "@/components/asset-designer/asset-designer-wizard/asset-basics/asset-basics";
import { SelectAssetClass } from "@/components/asset-designer/asset-designer-wizard/asset-class/select-asset-class";
import {
  AssetDesignerFormSchema,
  assetDesignerFormOptions,
} from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { AssetSpecificDetails } from "@/components/asset-designer/asset-designer-wizard/asset-specific-details/asset-specific-details";
import { SelectAssetType } from "@/components/asset-designer/asset-designer-wizard/asset-type/select-asset-type";
import { SelectComplianceModules } from "@/components/asset-designer/asset-designer-wizard/compliance-modules/select-compliance-modules";
import { Summary } from "@/components/asset-designer/asset-designer-wizard/summary/summary";
import {
  type AssetDesignerStepsType,
  useAssetDesignerSteps,
} from "@/components/asset-designer/asset-designer-wizard/use-asset-designer-steps";
import { StepLayout } from "@/components/stepper/step-layout";
import { StepLayoutSkeleton } from "@/components/stepper/step-layout-skeleton";
import {
  flattenSteps,
  getNextStep,
  getPreviousStep,
  getStepById,
} from "@/components/stepper/utils";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { FactoryList } from "@/orpc/routes/system/token-factory/routes/factory.list.schema";
import {
  type AssetType,
  getFactoryTypeIdFromAssetType,
} from "@atk/zod/asset-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import capitalize from "lodash.capitalize";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const AssetDesignerWizard = ({ onClose }: { onClose: () => void }) => {
  const { data: factories } = useQuery(
    orpc.system.factory.list.queryOptions({ input: {} })
  );
  const { data: complianceModules } = useQuery(
    orpc.system.compliance.list.queryOptions({ input: {} })
  );
  const { t } = useTranslation(["asset-designer"]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutateAsync: createToken } = useMutation(
    orpc.token.create.mutationOptions({
      onSuccess: async (_result, variables) => {
        form.reset();

        const tokenFactory = getFactoryAddressFromTypeId(
          factories ?? [],
          variables.type
        );

        await Promise.all([
          // Invalidate factory list queries
          queryClient.invalidateQueries({
            queryKey: orpc.system.factory.list.queryKey({
              input: { hasTokens: true },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.token.list.queryKey({
              input: { tokenFactory },
            }),
          }),
        ]);

        await navigate({
          to: "/token/$factoryAddress",
          params: { factoryAddress: tokenFactory },
        });

        onClose();
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
      const createTokenPromise = createToken(parsedValues);
      toast.promise(createTokenPromise, {
        loading: t("messages.creating", { type: parsedValues.type }),
        success: (data) =>
          t("messages.created", {
            type: capitalize(parsedValues.type),
            defaultValue: `${capitalize(parsedValues.type)} '${data.name} (${data.symbol})' created successfully`,
            name: data.name,
            symbol: data.symbol,
          }),
        error: (error: Error) =>
          `${t("messages.creation-failed", { type: parsedValues.type })} ${error.message}`,
      });
      // Return a promise so that the submitting state of the form is correctly set
      return new Promise<void>((resolve) => {
        void createTokenPromise.finally(() => {
          resolve();
        });
      });
    },
  });
  const type = useStore(form.store, (state) => state.values.type);
  const { stepsOrGroups } = useAssetDesignerSteps({ type });

  const stepId = useStore(form.store, (state) => state.values.step);
  const flatSteps = flattenSteps(stepsOrGroups);
  const currentStep = getStepById(flatSteps, stepId);
  const incrementStep = () => {
    const nextStep = getNextStep(flatSteps, currentStep);
    form.setFieldValue("step", nextStep.id);
  };
  const decrementStep = () => {
    const previousStep = getPreviousStep(flatSteps, currentStep);
    form.setFieldValue("step", previousStep.id);
  };

  const stepComponent: Record<AssetDesignerStepsType, JSX.Element> = {
    assetClass: <SelectAssetClass form={form} onStepSubmit={incrementStep} />,
    assetType: (
      <SelectAssetType
        form={form}
        onStepSubmit={incrementStep}
        onBack={decrementStep}
      />
    ),
    assetBasics: (
      <AssetBasics
        form={form}
        onStepSubmit={incrementStep}
        onBack={decrementStep}
      />
    ),
    assetSpecificConfig: (
      <AssetSpecificDetails
        form={form}
        onStepSubmit={incrementStep}
        onBack={decrementStep}
      />
    ),
    complianceModules: (
      <SelectComplianceModules
        form={form}
        onStepSubmit={incrementStep}
        complianceModules={complianceModules ?? []}
        onBack={decrementStep}
      />
    ),
    summary: (
      <Summary
        form={form}
        onSubmit={async () => {
          await form.handleSubmit();
        }}
        onBack={decrementStep}
      />
    ),
  };

  if (!factories || !complianceModules) {
    return <StepLayoutSkeleton className="rounded-xl" groupCount={3} />;
  }

  return (
    <form.AppForm>
      <StepLayout
        title={t("wizard.title")}
        description={t("wizard.description")}
        stepsOrGroups={stepsOrGroups}
        currentStep={currentStep}
        onStepSelect={(step) => {
          form.setFieldValue("step", step.id);
        }}
        navigationMode="next-and-completed"
        className="rounded-xl"
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
