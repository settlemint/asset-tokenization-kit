"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Form as UIForm } from "@/components/ui/form";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { z, type ZodInfer } from "@/lib/utils/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useTranslations } from "next-intl";
import type { HookSafeActionFn } from "next-safe-action/hooks";
import { useState } from "react";
import type { DefaultValues, Path, Resolver } from "react-hook-form";
import { toast } from "sonner";
import type { Schema } from "zod";
import { FormButton, type ButtonLabels } from "./form-button";
import { FormProgress } from "./form-progress";
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
}: FormProps<ServerError, S, BAS, CVE, CBAVE, Data, FormContext>) {
  const [currentStep, setCurrentStep] = useState(0);
  const t = useTranslations("transactions");
  const totalSteps = Array.isArray(children) ? children.length : 1;

  const { form, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(action, resolver, {
      formProps: {
        mode: "onSubmit",
        criteriaMode: "all",
        shouldFocusError: false,
        shouldUseNativeValidation: true,
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
          resetFormAndAction();
          onOpenChange?.(false);
        },
      },
    });

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
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
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  console.debug(form.formState.errors);

  return (
    <div className="space-y-6">
      <div className="container mt-8">
        <Card className="w-full pt-10">
          <CardContent>
            <UIForm {...form}>
              <form onSubmit={handleSubmitWithAction}>
                {totalSteps > 1 && (
                  <FormProgress
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                  />
                )}
                <div className="min-h-[400px]">
                  {Array.isArray(children) ? children[currentStep] : children}
                </div>
                <FormButton
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onPreviousStep={handlePrev}
                  onNextStep={() => {
                    void handleNext();
                  }}
                  labels={buttonLabels}
                />
              </form>
            </UIForm>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
