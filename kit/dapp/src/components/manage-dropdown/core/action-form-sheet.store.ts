import { Store } from "@tanstack/store";

export type ActionFormState = {
  step: "values" | "confirm";
  hasValuesStep: boolean;
};

export function createActionFormStore({
  hasValuesStep,
}: {
  hasValuesStep: boolean;
}): Store<ActionFormState> {
  return new Store<ActionFormState>({
    step: hasValuesStep ? "values" : "confirm",
    hasValuesStep,
  });
}
