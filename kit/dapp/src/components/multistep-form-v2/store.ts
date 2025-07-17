import { Store } from "@tanstack/react-store";

export function createMultistepFormStore<TFormData>(
  name: string,
  defaultValues: TFormData
) {
  return new Store<TFormData & { currentStep: string }>({
    ...defaultValues,
    currentStep: "selectAssetType", // Default to first step
  });
}
