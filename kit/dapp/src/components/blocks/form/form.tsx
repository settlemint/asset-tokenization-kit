"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form as UIForm } from "@/components/ui/form";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { type ZodInfer, z } from "@/lib/utils/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useTranslations } from "next-intl";
import type { HookSafeActionFn } from "next-safe-action/hooks";
import { useState } from "react";
import type { DefaultValues, Path, Resolver } from "react-hook-form";
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
  toastMessages?: {
    loading?: string;
    success?: string;
  };
  secureForm?: boolean;
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
  secureForm = false,
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

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setShowFormSecurityConfirmation(false);
  };

  const handleNext = async () => {
    const CurrentStep = Array.isArray(children)
      ? children[currentStep].type
      : children.type;
    const fieldsToValidate = CurrentStep.validatedFields;
    if (!fieldsToValidate?.length) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      return;
    }

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
      // Prevent the form from being auto submitted when going to the final step
      setTimeout(() => {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      }, 10);
    }
  };

  const isLastStep = currentStep === totalSteps - 1;
  const hasError = Object.keys(form.formState.errors).length > 0;

  return (
    <div className="space-y-6 h-full">
      <div className="container p-6 flex flex-col h-full">
        <UIForm {...form}>
          <form
            id="main-form"
            onSubmit={handleSubmitWithAction}
            noValidate
            className="flex flex-col flex-1"
          >
            {totalSteps > 1 && (
              <FormProgress currentStep={currentStep} totalSteps={totalSteps} />
            )}
            <div className="flex-1">
              {isLastStep && hasError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>{tError("validation-errors")}</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap">
                    {Object.entries(form.formState.errors)
                      .map(([key, error]) => {
                        const errorMessage =
                          (error?.message as string) ?? "unknown-error";
                        const translatedErrorMessage = tError.has(
                          errorMessage as never
                        )
                          ? tError(errorMessage as never)
                          : errorMessage;
                        const errorKey =
                          key && error?.type !== "custom" ? `${key}: ` : "";
                        return `${errorKey}${translatedErrorMessage}`;
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
                  label="Pincode"
                  description="Please enter your pincode"
                  showSecurityConfirmation={showFormSecurityConfirmation}
                  setShowSecurityConfirmation={setShowFormSecurityConfirmation}
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
                currentStep={currentStep}
                totalSteps={totalSteps}
                onPreviousStep={handlePrev}
                onNextStep={() => {
                  handleNext().catch((error: Error) => {
                    console.error("Error in handleNext:", error);
                  });
                }}
                labels={buttonLabels}
                {...(secureForm
                  ? {
                      onLastStep: () => {
                        setShowFormSecurityConfirmation(true);
                      },
                    }
                  : {})}
              />
            </div>
          </form>
        </UIForm>
      </div>
    </div>
  );
}
