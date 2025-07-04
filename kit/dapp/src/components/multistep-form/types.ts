import type { z } from "zod";

// Simple type placeholders - these will be properly typed at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormApi<TFormData = any> = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldApi<
  TFormData = any,
  TName extends keyof TFormData = any,
> = any;

export type StepStatus = "pending" | "active" | "completed" | "error";

export interface StepDefinition<TFormData = unknown> {
  id: string;
  title: string;
  description?: string;
  groupId?: string;
  fields?: FieldDefinition<TFormData>[];
  validate?: (
    formData: Partial<TFormData>
  ) => Promise<string | undefined> | string | undefined;
  onStepComplete?: (formData: Partial<TFormData>) => Promise<void> | void;
  mutation?: {
    mutationKey: string;
    mutationFn: (
      data: Partial<TFormData>
    ) =>
      | Promise<unknown>
      | AsyncGenerator<
          { status: string; message: string; result?: unknown },
          unknown,
          unknown
        >;
  };
  dependsOn?: (formData: Partial<TFormData>) => Promise<boolean> | boolean;
  component?: React.ComponentType<StepComponentProps<TFormData>>;
}

export interface FieldDefinition<TFormData = unknown> {
  name: keyof TFormData;
  label: string;
  description?: string;
  type:
    | "text"
    | "number"
    | "email"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea"
    | "custom";
  placeholder?: string;
  required?: boolean;
  schema?: z.ZodType;
  options?: Array<{ label: string; value: string }>;
  dependsOn?: (formData: Partial<TFormData>) => Promise<boolean> | boolean;
  component?: React.ComponentType<FieldComponentProps<TFormData>>;
  postfix?: string;
}

export interface StepGroup {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface StepComponentProps<TFormData = Record<string, unknown>> {
  form: FormApi<TFormData>;
  stepId: string;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface FieldComponentProps<
  TFormData = Record<string, unknown>,
  TName extends keyof TFormData = keyof TFormData,
> {
  field: FieldApi<TFormData, TName>;
  fieldDefinition: FieldDefinition<TFormData>;
}

export interface WizardState {
  currentStepIndex: number;
  completedSteps: string[];
  stepErrors: Record<string, string>;
  formData: Record<string, unknown>;
}

export interface UseMultiStepWizardStateOptions {
  name: string;
  enableUrlPersistence?: boolean;
  debounceMs?: number;
  defaultState?: Partial<WizardState>;
}

export interface MultiStepWizardProps<TFormData = unknown> {
  name: string;
  description?: string;
  steps: StepDefinition<TFormData>[];
  groups?: StepGroup[];
  onComplete: (data: TFormData) => void | Promise<void>;
  enableUrlPersistence?: boolean;
  debounceMs?: number;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  defaultValues?: Partial<TFormData>;
  showProgressBar?: boolean;
  allowStepSkipping?: boolean;
  persistFormData?: boolean;
}

export interface StepValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface WizardContextValue<TFormData = unknown> {
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  completedSteps: string[];
  markStepComplete: (stepId: string) => void;
  markStepError: (stepId: string, error: string) => void;
  clearStepError: (stepId: string) => void;
  stepErrors: Record<string, string>;
  form: FormApi<TFormData>;
  steps: StepDefinition<TFormData>[];
  groups?: StepGroup[];
  canNavigateToStep: (stepIndex: number) => boolean;
  navigateToStep: (stepIndex: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  resetWizard: () => void;
}
