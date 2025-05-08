"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form as UIForm } from "@/components/ui/form";
import { waitForIndexing } from "@/lib/queries/transactions/wait-for-indexing";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { revalidate } from "@/lib/utils/revalidate";
import { safeParse, t as tb } from "@/lib/utils/typebox";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Kind } from "@sinclair/typebox";
import { SetErrorFunction, ValueErrorType } from "@sinclair/typebox/errors";
import { useTranslations } from "next-intl";
import type { Infer, Schema } from "next-safe-action/adapters/types";
import type { HookSafeActionFn } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
import type {
  Control,
  DefaultValues,
  Path,
  PathValue,
  Resolver,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormReturn,
} from "react-hook-form";
import { toast, type Action } from "sonner";
import { FormButton, type ButtonLabels } from "./form-button";
import { FormProgress } from "./form-progress";
import { FormOtpDialog } from "./inputs/form-otp-dialog";
import type { FormStepElement } from "./types";

interface FormProps<
  ServerError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE,
  CBAVE,
  Data,
  FormContext = unknown,
> {
  children: FormStepElement<S> | FormStepElement<S>[];
  defaultValues?: DefaultValues<Infer<S>>;
  action: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, Data>;
  resolver: Resolver<Infer<S>, FormContext>;
  buttonLabels?: ButtonLabels;
  onOpenChange?: (open: boolean) => void;
  hideButtons?: boolean | ((step: number) => boolean);
  toastMessages?: {
    loading?: string;
    success?: string;
    action?: (input?: Infer<S>) => Action | undefined;
  };
  secureForm?: boolean;
  onAnyFieldChange?: (
    {
      getValues,
      clearErrors,
    }: {
      getValues: UseFormGetValues<Infer<S>>;
      clearErrors: UseFormClearErrors<Infer<S>>;
    },
    context: {
      step: number;
      goToStep: (step: number) => void;
      changedFieldName: Path<S extends Schema ? Infer<S> : any> | undefined;
    }
  ) => void;
  disablePreviousButton?: boolean;
}

export function Form<
  ServerError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE,
  CBAVE,
  Data,
  FormContext = unknown,
>({
  children,
  defaultValues,
  action,
  resolver,
  buttonLabels,
  onOpenChange,
  toastMessages,
  hideButtons,
  onAnyFieldChange,
  secureForm = true,
  disablePreviousButton = false,
}: FormProps<ServerError, S, BAS, CVE, CBAVE, Data, FormContext>) {
  const [currentStep, setCurrentStep] = useState(0);
  const t = useTranslations();
  const totalSteps = Array.isArray(children) ? children.length : 1;
  const [showFormSecurityConfirmation, setShowFormSecurityConfirmation] =
    useState(false);

  SetErrorFunction((error) => {
    switch (error.errorType) {
      case ValueErrorType.ArrayContains:
        return t("error.array-contains");
      case ValueErrorType.ArrayMaxContains:
        return t("error.array-max-contains", {
          maxContains: error.schema.maxContains,
        });
      case ValueErrorType.ArrayMinContains:
        return t("error.array-min-contains", {
          minContains: error.schema.minContains,
        });
      case ValueErrorType.ArrayMaxItems:
        return t("error.array-max-items", { maxItems: error.schema.maxItems });
      case ValueErrorType.ArrayMinItems:
        return t("error.array-min-items", { minItems: error.schema.minItems });
      case ValueErrorType.ArrayUniqueItems:
        return t("error.array-unique-items");
      case ValueErrorType.Array:
        return t("error.array");
      case ValueErrorType.AsyncIterator:
        return t("error.async-iterator");
      case ValueErrorType.BigIntExclusiveMaximum:
        return t("error.bigint-exclusive-maximum", {
          exclusiveMaximum: error.schema.exclusiveMaximum,
        });
      case ValueErrorType.BigIntExclusiveMinimum:
        return t("error.bigint-exclusive-minimum", {
          exclusiveMinimum: error.schema.exclusiveMinimum,
        });
      case ValueErrorType.BigIntMaximum:
        return t("error.bigint-maximum", { maximum: error.schema.maximum });
      case ValueErrorType.BigIntMinimum:
        return t("error.bigint-minimum", { minimum: error.schema.minimum });
      case ValueErrorType.BigIntMultipleOf:
        return t("error.bigint-multiple-of", {
          multipleOf: error.schema.multipleOf,
        });
      case ValueErrorType.BigInt:
        return t("error.bigint");
      case ValueErrorType.Boolean:
        return t("error.boolean");
      case ValueErrorType.DateExclusiveMinimumTimestamp:
        return t("error.date-exclusive-minimum-timestamp", {
          exclusiveMinimumTimestamp: error.schema.exclusiveMinimumTimestamp,
        });
      case ValueErrorType.DateExclusiveMaximumTimestamp:
        return t("error.date-exclusive-maximum-timestamp", {
          exclusiveMaximumTimestamp: error.schema.exclusiveMaximumTimestamp,
        });
      case ValueErrorType.DateMinimumTimestamp:
        return t("error.date-minimum-timestamp", {
          minimumTimestamp: error.schema.minimumTimestamp,
        });
      case ValueErrorType.DateMaximumTimestamp:
        return t("error.date-maximum-timestamp", {
          maximumTimestamp: error.schema.maximumTimestamp,
        });
      case ValueErrorType.DateMultipleOfTimestamp:
        return t("error.date-multiple-of-timestamp", {
          multipleOfTimestamp: error.schema.multipleOfTimestamp,
        });
      case ValueErrorType.Date:
        return t("error.date");
      case ValueErrorType.Function:
        return t("error.function");
      case ValueErrorType.IntegerExclusiveMaximum:
        return t("error.integer-exclusive-maximum", {
          exclusiveMaximum: error.schema.exclusiveMaximum,
        });
      case ValueErrorType.IntegerExclusiveMinimum:
        return t("error.integer-exclusive-minimum", {
          exclusiveMinimum: error.schema.exclusiveMinimum,
        });
      case ValueErrorType.IntegerMaximum:
        return t("error.integer-maximum", { maximum: error.schema.maximum });
      case ValueErrorType.IntegerMinimum:
        return t("error.integer-minimum", { minimum: error.schema.minimum });
      case ValueErrorType.IntegerMultipleOf:
        return t("error.integer-multiple-of", {
          multipleOf: error.schema.multipleOf,
        });
      case ValueErrorType.Integer:
        return t("error.integer");
      case ValueErrorType.IntersectUnevaluatedProperties:
        return t("error.intersect-unevaluated-properties");
      case ValueErrorType.Intersect:
        return t("error.intersect");
      case ValueErrorType.Iterator:
        return t("error.iterator");
      case ValueErrorType.Literal:
        return t("error.literal", {
          const:
            typeof error.schema.const === "string"
              ? `'${error.schema.const}'`
              : error.schema.const,
        });
      case ValueErrorType.Never:
        return t("error.never");
      case ValueErrorType.Not:
        return t("error.not");
      case ValueErrorType.Null:
        return t("error.null");
      case ValueErrorType.NumberExclusiveMaximum:
        return t("error.number-exclusive-maximum", {
          exclusiveMaximum: error.schema.exclusiveMaximum,
        });
      case ValueErrorType.NumberExclusiveMinimum:
        return t("error.number-exclusive-minimum", {
          exclusiveMinimum: error.schema.exclusiveMinimum,
        });
      case ValueErrorType.NumberMaximum:
        return t("error.number-maximum", { maximum: error.schema.maximum });
      case ValueErrorType.NumberMinimum:
        return t("error.number-minimum", { minimum: error.schema.minimum });
      case ValueErrorType.NumberMultipleOf:
        return t("error.number-multiple-of", {
          multipleOf: error.schema.multipleOf,
        });
      case ValueErrorType.Number:
        return t("error.number");
      case ValueErrorType.Object:
        return t("error.object");
      case ValueErrorType.ObjectAdditionalProperties:
        return t("error.object-additional-properties");
      case ValueErrorType.ObjectMaxProperties:
        return t("error.object-max-properties", {
          maxProperties: error.schema.maxProperties,
        });
      case ValueErrorType.ObjectMinProperties:
        return t("error.object-min-properties", {
          minProperties: error.schema.minProperties,
        });
      case ValueErrorType.ObjectRequiredProperty:
        return t("error.object-required-property");
      case ValueErrorType.Promise:
        return t("error.promise");
      case ValueErrorType.RegExp:
        return t("error.regexp");
      case ValueErrorType.StringFormatUnknown:
        return t("error.string-format-unknown", {
          format: error.schema.format,
        });
      case ValueErrorType.StringFormat:
        return t("error.string-format", { format: error.schema.format });
      case ValueErrorType.StringMaxLength:
        return t("error.string-max-length", {
          maxLength: error.schema.maxLength,
        });
      case ValueErrorType.StringMinLength:
        return t("error.string-min-length", {
          minLength: error.schema.minLength,
        });
      case ValueErrorType.StringPattern:
        return t("error.string-pattern", { pattern: error.schema.pattern });
      case ValueErrorType.String:
        return t("error.string");
      case ValueErrorType.Symbol:
        return t("error.symbol");
      case ValueErrorType.TupleLength:
        return t("error.tuple-length", {
          maxItems: error.schema.maxItems || 0,
        });
      case ValueErrorType.Tuple:
        return t("error.tuple");
      case ValueErrorType.Uint8ArrayMaxByteLength:
        return t("error.uint8array-max-byte-length", {
          maxByteLength: error.schema.maxByteLength,
        });
      case ValueErrorType.Uint8ArrayMinByteLength:
        return t("error.uint8array-min-byte-length", {
          minByteLength: error.schema.minByteLength,
        });
      case ValueErrorType.Uint8Array:
        return t("error.uint8array");
      case ValueErrorType.Undefined:
        return t("error.undefined");
      case ValueErrorType.Union:
        return t("error.union");
      case ValueErrorType.Void:
        return t("error.void");
      case ValueErrorType.Kind:
        return t("error.kind", { kind: error.schema[Kind] });
      default:
        return t("error.unknown");
    }
  });

  const { form, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(
      action,
      resolver as Resolver<S extends Schema ? Infer<S> : any, FormContext>,
      {
        formProps: {
          mode: "onSubmit",
          criteriaMode: "all",
          shouldFocusError: false,
          defaultValues,
        },
        actionProps: {
          onSuccess: async ({ data, input }) => {
            if (secureForm) {
              const hashes = safeParse(tb.Hashes(), data);

              const successMessage =
                toastMessages?.success || t("transactions.success");
              const action = toastMessages?.action
                ? toastMessages.action(input)
                : undefined;

              const toastId = Date.now();
              toast.promise(waitForTransactions(hashes), {
                loading: t("transactions.sending"),
                success: async (results) => {
                  const lastBlockNumber = Number(results.at(-1)?.blockNumber);
                  await waitForIndexing(lastBlockNumber);
                  await revalidate();

                  toast.dismiss(toastId);
                  return toast.success(successMessage, {
                    action,
                    actionButtonStyle: {
                      backgroundColor: "var(--success-fg-deep)",
                      color: "var(--primary-foreground)",
                    },
                  });
                },
                error: (error) =>
                  `Failed to submit: ${(error as Error).message}`,
                id: toastId,
              });
            }

            resetFormAndAction();
            onOpenChange?.(false);
          },
          onError: (error) => {
            let errorMessage = "Unknown error";

            if (error?.error?.serverError) {
              errorMessage = error.error.serverError as string;
            } else if (error?.error?.validationErrors) {
              errorMessage = "Validation error";
            }

            if (secureForm) {
              form.setValue(
                "verificationCode" as Path<
                  S extends Schema ? Infer<S> : string
                >,
                "" as PathValue<
                  S extends Schema ? Infer<S> : string,
                  Path<S extends Schema ? Infer<S> : string>
                >
              );
            }

            toast.error(`Failed to submit: ${errorMessage}`);
          },
        },
      }
    );

  const { getValues, clearErrors, watch } = form;

  const isLastStep = currentStep === totalSteps - 1;

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = useCallback(async () => {
    const CurrentStep = Array.isArray(children)
      ? children[currentStep].type
      : children.type;

    const fieldsToValidate = CurrentStep.validatedFields ?? [];
    const customValidation = CurrentStep.customValidation ?? [];

    const shouldValidate = fieldsToValidate?.length || customValidation?.length;
    if (!shouldValidate) {
      if (isLastStep && secureForm) {
        setShowFormSecurityConfirmation(true);
      }
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      return;
    }

    // Validate using the custom validation function
    const customValidationResults = await Promise.all(
      customValidation.map((validate) =>
        validate(form as UseFormReturn<Infer<S>>)
      )
    );
    if (customValidationResults.some((result) => result === false)) {
      return;
    }

    // Validate using the schema
    for (const field of fieldsToValidate) {
      const value = form.getValues(
        field as Path<S extends Schema ? Infer<S> : any>
      );

      form.setValue(field as Path<S extends Schema ? Infer<S> : any>, value, {
        shouldValidate: true,
        shouldTouch: true,
      });
    }

    const results = await Promise.all(
      fieldsToValidate.map((field) =>
        form.trigger(field as Path<S extends Schema ? Infer<S> : any>, {
          shouldFocus: true,
        })
      )
    );

    if (results.every(Boolean)) {
      if (isLastStep && secureForm) {
        setShowFormSecurityConfirmation(true);
      }

      // Prevent the form from being auto submitted when going to the final step
      setTimeout(() => {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      }, 10);
    }
  }, [form, isLastStep, secureForm, currentStep, totalSteps, children]);

  useEffect(() => {
    if (!onAnyFieldChange) {
      return;
    }

    const subscription = watch((_value, { name }) => {
      onAnyFieldChange(
        {
          getValues: getValues as UseFormGetValues<Infer<S>>,
          clearErrors: clearErrors as UseFormClearErrors<Infer<S>>,
        },
        {
          changedFieldName: name,
          step: currentStep,
          goToStep: setCurrentStep,
        }
      );
    });

    return () => subscription.unsubscribe();
  }, [onAnyFieldChange, currentStep, watch, clearErrors, getValues]);

  const hasError = Object.keys(form.formState.errors).length > 0;
  const formatError = (key: string, errorMessage?: string, type?: string) => {
    const error = errorMessage ?? "unknown-error";
    const translatedErrorMessage = t.has(error as never)
      ? t(error as never)
      : error;
    const errorKey = key && type !== "custom" ? `${key}: ` : "";

    return `${errorKey}${translatedErrorMessage}`;
  };

  return (
    <div className="h-full space-y-6">
      <div className="container flex h-full flex-col p-6">
        <UIForm {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            noValidate
            className="flex flex-1 flex-col"
          >
            {totalSteps > 1 && (
              <FormProgress currentStep={currentStep} totalSteps={totalSteps} />
            )}
            <div className="flex-1">
              {isLastStep && hasError && (
                <Alert
                  variant="destructive"
                  className="mb-4 border-destructive text-destructive"
                >
                  <AlertTitle>{t("transactions.validation-errors")}</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap">
                    {Object.entries(form.formState.errors)
                      .map(([key, error]) => {
                        return formatError(
                          key,
                          error?.message as string,
                          error?.type as string
                        );
                      })
                      .filter(Boolean)
                      .join("\n")}
                  </AlertDescription>
                </Alert>
              )}
              {Array.isArray(children) ? children[currentStep] : children}
              {showFormSecurityConfirmation && (
                <FormOtpDialog
                  name={"verificationCode" as Path<Infer<S>>}
                  open={showFormSecurityConfirmation}
                  onOpenChange={setShowFormSecurityConfirmation}
                  control={form.control as Control<Infer<S>>}
                  onSubmit={() =>
                    handleSubmitWithAction()
                      .catch((error: Error) => {
                        console.error("Error submitting form:", error);
                      })
                      .finally(() => {
                        form.resetField(
                          "verificationCode" as Path<
                            S extends Schema ? Infer<S> : any
                          >
                        );
                      })
                  }
                />
              )}
            </div>
            <div className="mt-auto pt-6 mb-5">
              <FormButton
                hideButtons={
                  typeof hideButtons === "function"
                    ? hideButtons(currentStep)
                    : hideButtons
                }
                currentStep={currentStep}
                totalSteps={totalSteps}
                onPreviousStep={handlePrev}
                onNextStep={() => {
                  handleNext().catch((error: Error) => {
                    console.error("Error in handleNext:", error);
                  });
                }}
                labels={buttonLabels}
                onLastStep={secureForm ? handleNext : handleSubmitWithAction}
                isSecurityDialogOpen={showFormSecurityConfirmation}
                disablePreviousButton={disablePreviousButton}
              />
            </div>
          </form>
        </UIForm>
      </div>
    </div>
  );
}
