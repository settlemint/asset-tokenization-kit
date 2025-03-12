"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form as UIForm } from "@/components/ui/form";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { type ZodInfer, z } from "@/lib/utils/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useTranslations } from "next-intl";
import type { HookSafeActionFn } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import type {
  DefaultValues,
  Path,
  Resolver,
  UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";
import type { Schema } from "zod";
import { type ButtonLabels, FormButton } from "./form-button";
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
  defaultValues?: DefaultValues<ZodInfer<S>>;
  action: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, Data>;
  resolver: Resolver<ZodInfer<S>, FormContext>;
  buttonLabels?: ButtonLabels;
  onOpenChange?: (open: boolean) => void;
  hideButtons?: boolean;
  toastMessages?: {
    loading?: string;
    success?: string;
  };
  secureForm?: boolean;
  onAnyFieldChange?: (form: UseFormReturn<ZodInfer<S>>) => void;
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
}: FormProps<ServerError, S, BAS, CVE, CBAVE, Data, FormContext>) {
  const [currentStep, setCurrentStep] = useState(0);
  const t = useTranslations("transactions");
  const tError = useTranslations("error");
  const totalSteps = Array.isArray(children) ? children.length : 1;
  const [showFormSecurityConfirmation, setShowFormSecurityConfirmation] =
    useState(false);

  const { form, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(action, resolver, {
      formProps: {
        mode: "onSubmit",
        criteriaMode: "all",
        shouldFocusError: false,
        defaultValues,
      },
      actionProps: {
        onSuccess: ({ data }) => {
          const hashes = z.hashes().parse(data);
          toast.promise(waitForTransactions(hashes), {
            loading: toastMessages?.loading || t("sending"),
            success: toastMessages?.success || t("success"),
            error: (error: Error) => `Failed to submit: ${error.message}`,
          });
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

          toast.error(`Failed to submit: ${errorMessage}`);
        },
      },
    });

  useEffect(() => {
    if (!onAnyFieldChange) return;

    const subscription = form.watch(() => {
      onAnyFieldChange(form);
    });

    return () => subscription.unsubscribe();
  }, [form, onAnyFieldChange]);

  const isLastStep = currentStep === totalSteps - 1;

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = async () => {
    const CurrentStep = Array.isArray(children)
      ? children[currentStep].type
      : children.type;
    const fieldsToValidate = CurrentStep.validatedFields;
    if (!fieldsToValidate?.length) {
      if (isLastStep && secureForm) {
        setShowFormSecurityConfirmation(true);
      }
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      return;
    }

    const beforeValidate = CurrentStep.beforeValidate ?? [];
    await Promise.all(beforeValidate.map((validate) => validate(form)));

    for (const field of fieldsToValidate) {
      const value = form.getValues(field as Path<ZodInfer<S>>);

      form.setValue(field as Path<ZodInfer<S>>, value, {
        shouldValidate: true,
        shouldTouch: true,
      });
    }

    const results = await Promise.all(
      fieldsToValidate.map((field) =>
        form.trigger(field as Path<ZodInfer<S>>, { shouldFocus: true })
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
  };

  const hasError = Object.keys(form.formState.errors).length > 0;
  const formatError = (key: string, errorMessage?: string, type?: string) => {
    const error = errorMessage ?? "unknown-error";
    const translatedErrorMessage = tError.has(error as never)
      ? tError(error as never)
      : error;
    const errorKey = key && type !== "custom" ? `${key}: ` : "";

    return `${errorKey}${translatedErrorMessage}`;
  };
  return (
    <div className="space-y-6 h-full">
      <div className="container p-6 flex flex-col h-full">
        <UIForm {...form}>
          <form
            onSubmit={handleSubmitWithAction}
            noValidate
            className="flex flex-col flex-1"
          >
            {totalSteps > 1 && (
              <FormProgress currentStep={currentStep} totalSteps={totalSteps} />
            )}
            <div className="flex-1">
              {isLastStep && hasError && (
                <Alert
                  variant="destructive"
                  className="text-destructive border-destructive mb-4"
                >
                  <AlertTitle>{tError("validation-errors")}</AlertTitle>
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
                  name={"pincode" as Path<ZodInfer<S>>}
                  open={showFormSecurityConfirmation}
                  onOpenChange={setShowFormSecurityConfirmation}
                  control={form.control}
                  onSubmit={() => {
                    handleSubmitWithAction().catch((error: Error) => {
                      console.error("Error submitting form:", error);
                    });
                  }}
                />
              )}
            </div>
            <div className="mt-auto pt-6">
              <FormButton
                hideButtons={hideButtons}
                currentStep={currentStep}
                totalSteps={totalSteps}
                onPreviousStep={handlePrev}
                onNextStep={() => {
                  handleNext().catch((error: Error) => {
                    console.error("Error in handleNext:", error);
                  });
                }}
                labels={buttonLabels}
                onLastStep={secureForm ? handleNext : undefined}
                isSecurityDialogOpen={showFormSecurityConfirmation}
              />
            </div>
          </form>
        </UIForm>
      </div>
    </div>
  );
}
