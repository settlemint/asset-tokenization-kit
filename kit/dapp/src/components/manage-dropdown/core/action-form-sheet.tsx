import React from "react";
import { Store } from "@tanstack/store";
import { useStore } from "@tanstack/react-store";
import {
  createActionFormStore,
  type ActionFormState,
} from "./action-form-sheet.store";
import { BaseActionSheet } from "./base-action-sheet";
import { useAppForm } from "@/hooks/use-app-form";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { AnyFieldMeta } from "@tanstack/react-form";
// Uses form.VerificationButton via useAppForm context

interface ActionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
  title: string;
  description: string;
  submitLabel: string;
  disabled?:
    | boolean
    | ((args: { isDirty: boolean; errors: AnyFieldMeta["errors"] }) => boolean);
  isSubmitting?: boolean;
  children?: React.ReactNode;
  confirm?: React.ReactNode;
  hasValuesStep?: boolean;
  canContinue?: (args: {
    isDirty: boolean;
    errors: AnyFieldMeta["errors"];
  }) => boolean;
  onSubmit: (verification: {
    verificationCode: string;
    verificationType?: "pincode" | "secret-code" | "two-factor";
  }) => void;
  store?: Store<ActionFormState>;
  // Whether to show the asset details card on the confirm step
  showAssetDetailsOnConfirm?: boolean;
}

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

  function Stepper() {
    if (!hasSteps) return null;
    const isConfirm = step === "confirm";
    return (
      <div className="mb-4 space-y-2" aria-label="form-steps">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
          <span className={isConfirm ? "opacity-60" : "opacity-100"}>
            Values
          </span>
          <span className={isConfirm ? "opacity-100" : "opacity-60"}>
            Confirm
          </span>
        </div>
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
  const form = useAppForm({
    onSubmit: () => {
      // validation handled by VerificationButton wrapper
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
          step === "confirm" ? (
            <form.VerificationButton
              verification={{
                title,
                description,
                setField: (verification) => {
                  form.setFieldValue("verification", verification);
                },
              }}
              disabled={(args) =>
                (typeof disabled === "function"
                  ? disabled(args)
                  : !!disabled) || !!isSubmitting
              }
              onSubmit={() => {
                const v = form.getFieldValue("verification") as
                  | {
                      verificationCode: string;
                      verificationType?:
                        | "pincode"
                        | "secret-code"
                        | "two-factor";
                    }
                  | undefined;
                if (v) onSubmit(v);
              }}
            >
              {submitLabel}
            </form.VerificationButton>
          ) : (
            <form.Subscribe
              selector={(s) => ({ isDirty: s.isDirty, errors: s.errors })}
            >
              {({ isDirty, errors }) => (
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
                  onClick={() => {
                    internalStore.setState((s) => ({ ...s, step: "confirm" }));
                  }}
                  disabled={
                    canContinue ? !canContinue({ isDirty, errors }) : false
                  }
                >
                  {"Continue"}
                </button>
              )}
            </form.Subscribe>
          )
        }
      >
        <Stepper />
        {step === "values" ? children : confirm}
      </BaseActionSheet>
    </form.AppForm>
  );
}

// Store helpers moved to separate file to keep component exports consistent
