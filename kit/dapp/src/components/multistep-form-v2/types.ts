import type { Store } from "@tanstack/react-store";

export interface FormGroupProps<TFormData> {
  store: Store<TFormData>;
  onGroupSubmit: (data: Partial<TFormData>) => void;
  onValidationError?: (error: string) => void;
}
