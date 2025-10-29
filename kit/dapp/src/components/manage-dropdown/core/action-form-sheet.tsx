import { useAppForm } from "@/hooks/use-app-form";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { AnyFieldMeta } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import React from "react";
import {
  createActionFormStore,
  type ActionFormState,
} from "./action-form-sheet.store";
import { BaseActionSheet } from "./base-action-sheet";
// Uses form.VerificationButton via useAppForm context

/**
 * Props for the ActionFormSheet component.
 *
 * @remarks
 * PATTERN: This component implements a standardized two-step form pattern used throughout
 * the asset management system for sensitive operations (mint, burn, transfer, etc.).
 */
interface ActionFormSheetProps {
  /** Controls sheet visibility */
  open: boolean;
  /** Callback when sheet open state changes */
  onOpenChange: (open: boolean) => void;
  /** Token/asset being operated on */
  asset?: Pick<Token, "id" | "name" | "symbol">;
  /** Sheet title displayed to user */
  title: string;
  /** Description of the operation */
  description: string;
  /** Label for the final submit button */
  submitLabel: string;
  /** Disable logic - can be static boolean or dynamic function based on form state */
  disabled?:
    | boolean
    | ((args: { isDirty: boolean; errors: AnyFieldMeta["errors"] }) => boolean);
  /** Whether the operation is currently being submitted */
  isSubmitting?: boolean;
  /** Form content for the values step */
  children?: React.ReactNode;
  /** Confirmation content for the confirm step */
  confirm?: React.ReactNode;
  /** Whether to show the values step (some operations may go directly to confirm) */
  hasValuesStep?: boolean;
  /** Function to determine if user can proceed from values to confirm step */
  canContinue?: (args: {
    isDirty: boolean;
    errors: AnyFieldMeta["errors"];
  }) => boolean;
  /** Callback executed after successful wallet verification */
  onSubmit: (verification: UserVerification) => void;
  /** Optional external state store for step management */
  store?: Store<ActionFormState>;
  /** Whether to show asset details card on the confirm step */
  showAssetDetailsOnConfirm?: boolean;
}

/**
 * Reusable multi-step form sheet for sensitive asset management operations.
 *
 * @remarks
 * SECURITY PATTERN: Implements a consistent two-step workflow that separates data entry
 * from final confirmation with wallet verification. This prevents accidental operations
 * and ensures user intent is clearly confirmed before blockchain transactions.
 *
 * WORKFLOW:
 * 1. Values Step: User inputs operation parameters (amounts, addresses, etc.)
 * 2. Confirm Step: User reviews operation details and provides wallet verification
 *
 * STATE MANAGEMENT: Uses TanStack Store for step management, allowing external control
 * of the workflow state. Each operation can customize the flow while maintaining consistency.
 *
 * REUSABILITY: Serves as the foundation for mint, burn, transfer, role management,
 * and other sensitive operations across the asset tokenization platform.
 *
 * ACCESSIBILITY: Includes proper ARIA labels and semantic structure for screen readers.
 */
export function ActionFormSheet({
  open,
  onOpenChange,
  asset,
  title,
  description,
  submitLabel,
  disabled,
  isSubmitting,
  children,
  confirm,
  hasValuesStep = true,
  canContinue,
  onSubmit,
  store,
  showAssetDetailsOnConfirm = true,
}: ActionFormSheetProps) {
  // STORE: Create or use external store for step state management
  // Memoized to prevent unnecessary re-creation on re-renders
  const internalStore = React.useMemo(
    () =>
      store ??
      createActionFormStore({
        hasValuesStep,
      }),
    [store, hasValuesStep]
  );
  const { step } = useStore(internalStore);
  const hasSteps = useStore(internalStore).hasValuesStep;

  // COMPONENT: Progress stepper showing current step in the workflow
  function Stepper() {
    if (!hasSteps) return null;
    const isConfirm = step === "confirm";
    return (
      <div className="mb-4 space-y-2" aria-label="form-steps">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
          {/* UX: Visual feedback showing active/inactive steps */}
          <span className={isConfirm ? "opacity-60" : "opacity-100"}>
            Values
          </span>
          <span className={isConfirm ? "opacity-100" : "opacity-60"}>
            Confirm
          </span>
        </div>
        {/* PROGRESS: Animated progress bar indicating workflow completion */}
        <div className="h-1 w-full rounded bg-muted/50">
          <div
            className={`h-1 rounded bg-primary transition-all duration-300 ${
              isConfirm ? "w-full" : "w-1/2"
            }`}
          />
        </div>
      </div>
    );
  }

  // FORM: Initialize form context for child components
  const form = useAppForm({
    onSubmit: () => {
      // WHY: Actual submission is handled by VerificationButton component
      // This allows the verification flow to control the final submission timing
    },
  });

  return (
    <form.AppForm>
      <BaseActionSheet
        open={open}
        onOpenChange={onOpenChange}
        asset={asset}
        title={title}
        description={description}
        showAssetDetails={showAssetDetailsOnConfirm && step === "confirm"}
        onCancel={() => {
          onOpenChange(false);
        }}
        submit={
          // CONDITIONAL: Different submit button based on current step
          step === "confirm" ? (
            // SECURITY: Final step requires wallet verification before execution
            <form.VerificationButton
              walletVerification={{
                title,
                description,
                setField: (verification) => {
                  // STORAGE: Store verification data in form field for submission
                  form.setFieldValue("verification", verification);
                },
              }}
              disabled={(args) =>
                // LOGIC: Combine parent disable logic with submission state
                (typeof disabled === "function"
                  ? disabled(args)
                  : !!disabled) || !!isSubmitting
              }
              onSubmit={() => {
                // EXTRACTION: Get verification data from form field
                const v = form.getFieldValue("verification") as
                  | UserVerification
                  | undefined;
                // SAFETY: Only proceed if verification data is present
                if (v) onSubmit(v);
              }}
            >
              {submitLabel}
            </form.VerificationButton>
          ) : (
            // NAVIGATION: Continue button for values step
            <form.Subscribe
              selector={(s) => ({ isDirty: s.isDirty, errors: s.errors })}
            >
              {({ isDirty, errors }) => (
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
                  onClick={() => {
                    // STATE: Advance to confirmation step
                    internalStore.setState((s) => ({ ...s, step: "confirm" }));
                  }}
                  disabled={
                    // VALIDATION: Use parent validation logic or default to always enabled
                    canContinue ? !canContinue({ isDirty, errors }) : false
                  }
                >
                  Continue
                </button>
              )}
            </form.Subscribe>
          )
        }
      >
        <Stepper />
        {/* CONTENT: Show form inputs or confirmation based on current step */}
        {step === "values" ? children : confirm}
      </BaseActionSheet>
    </form.AppForm>
  );
}

// Store helpers moved to separate file to keep component exports consistent
