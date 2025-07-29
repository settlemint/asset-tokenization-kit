import {
  useAssetClassSelectionSteps,
  type AssetClassSelectionStepsType,
} from "@/components/asset-designer/asset-class/steps";
import { getNextStepId, getPreviousStepId } from "@/components/stepper/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppForm } from "@/hooks/use-app-form";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import type { JSX } from "react";
import { SelectAssetClass } from "./select-asset-class";
import { SelectAssetType } from "./select-asset-type";
import {
  assetClassSelectionFormOptions,
  AssetClassSelectionSchema,
} from "./shared-form";

interface AssetClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetClassModal({ open, onOpenChange }: AssetClassModalProps) {
  const navigate = useNavigate();
  const steps = useAssetClassSelectionSteps();
  const form = useAppForm({
    ...assetClassSelectionFormOptions,
    validators: {
      onChange: AssetClassSelectionSchema,
    },
    onSubmit: async (values) => {
      const parsedValues = AssetClassSelectionSchema.parse(values.value);

      if (parsedValues.assetClass && parsedValues.assetType) {
        await navigate({
          to: "/asset-designer",
          search: {
            type: parsedValues.assetType,
          },
        });
        onOpenChange(false);
      }
    },
  });

  // Get current step from form
  const currentStep = useStore(form.store, (state) => state.values.step);

  const incrementStep = () => {
    const nextStep = getNextStepId(steps, currentStep);
    form.setFieldValue("step", nextStep);
  };

  const decrementStep = () => {
    const previousStep = getPreviousStepId(steps, currentStep);
    form.setFieldValue("step", previousStep);
  };

  const handleClose = () => {
    form.reset();
  };

  const stepComponent: Record<AssetClassSelectionStepsType, JSX.Element> = {
    assetClass: (
      <SelectAssetClass
        form={form}
        onStepSubmit={incrementStep}
        onCancel={handleClose}
      />
    ),
    assetType: (
      <SelectAssetType
        form={form}
        onStepSubmit={incrementStep}
        onBack={decrementStep}
        onCancel={handleClose}
      />
    ),
  };

  return (
    <form.AppForm>
      <Dialog
        open={open}
        onOpenChange={(open) => {
          const closed = !open;
          if (closed) {
            handleClose();
          }
          onOpenChange(open);
        }}
      >
        <DialogContent className="sm:max-w-2xl md:max-w-4xl lg:max-w-6xl overflow-hidden">
          {stepComponent[currentStep]}
        </DialogContent>
      </Dialog>
    </form.AppForm>
  );
}
