import {
  FormStepContent,
  FormStepSubmit,
} from "@/components/form/multi-step/form-step";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/use-app-form";
import { useSession } from "@/hooks/use-auth";
import { orpc } from "@/orpc/orpc-client";
import type { KycUpsertInput } from "@/orpc/routes/user/kyc/routes/kyc.upsert.schema";
import { KycUpsertInputSchema } from "@/orpc/routes/user/kyc/routes/kyc.upsert.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

/**
 * Props for the KYC (Know Your Customer) form component.
 */
interface KycFormProps {
  /** Callback executed after successful KYC completion */
  onComplete: () => void | Promise<void>;
}

/**
 * KYC (Know Your Customer) form component that handles identity verification and compliance.
 *
 * @remarks
 * COMPLIANCE: Collects mandatory identity information required for financial regulations
 * and anti-money laundering (AML) compliance in asset tokenization platforms.
 *
 * PERFORMANCE: Optimistically invalidates related queries on success to maintain
 * consistent UI state across user profile, sidebar, and dropdown components.
 *
 * @param onComplete - Callback executed after successful KYC submission
 */
export function KycForm({ onComplete }: KycFormProps) {
  const { t } = useTranslation(["components"]);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // DATABASE: Mutation for updating KYC data in application database
  const { mutateAsync: updateKyc, isPending: isUpdatingKyc } = useMutation(
    orpc.user.kyc.upsert.mutationOptions({
      onSuccess: async () => {
        // PERFORMANCE: Update UI components that depend on user KYC status
        // Sidebar and dropdown show different options based on KYC completion
        await queryClient.invalidateQueries({
          queryKey: orpc.user.me.queryKey(),
          refetchType: "all",
        });
        await onComplete();
      },
    })
  );

  // INITIALIZATION: Load existing KYC data for form pre-population
  const { data: kyc } = useQuery(
    orpc.user.kyc.read.queryOptions({
      input: {
        userId: session?.user.id ?? "",
      },
      enabled: !!session?.user.id,
      // EDGE CASE: New users won't have KYC data yet, so don't retry on 404
      // This prevents unnecessary error logging and API calls
      retry: false,
      throwOnError: false,
    })
  );

  const form = useAppForm({
    defaultValues: {
      // INITIALIZATION: Pre-populate form with existing KYC data if available
      ...kyc,
      userId: session?.user.id ?? "",
    } as KycUpsertInput,
    validators: {
      // VALIDATION: Real-time validation on form changes using Zod schema
      onChange: KycUpsertInputSchema,
    },
    onSubmit: ({ value }) => {
      const promise = async () => {
        await updateKyc({
          ...value,
          userId: session?.user.id ?? "",
        });
      };

      // UX: Provide user feedback during the async operation
      toast.promise(promise(), {
        loading: t("kycForm.submission.loading"),
        success: t("kycForm.submission.success"),
        error: (error: Error) =>
          `${t("kycForm.submission.error")}${error.message}`,
      });
    },
  });

  // COMPLIANCE: Pre-defined residency status options for regulatory compliance
  // These align with common financial regulatory requirements for tax purposes
  const residencyStatusOptions = useMemo(
    () => [
      {
        label: t("kycForm.residencyStatusOptions.resident"),
        value: "resident",
      },
      {
        label: t("kycForm.residencyStatusOptions.non_resident"),
        value: "non_resident",
      },
      {
        label: t("kycForm.residencyStatusOptions.dual_resident"),
        value: "dual_resident",
      },
      {
        label: t("kycForm.residencyStatusOptions.unknown"),
        value: "unknown",
      },
    ],
    [t]
  );

  return (
    <div className="space-y-6">
      <form.AppForm>
        <FormStepContent asGrid fullWidth>
          <form.AppField
            name="firstName"
            children={(field) => (
              <field.TextField label={t("kycForm.firstName")} required={true} />
            )}
          />
          <form.AppField
            name="lastName"
            children={(field) => (
              <field.TextField label={t("kycForm.lastName")} required={true} />
            )}
          />
          <form.AppField
            name="dob"
            children={(field) => (
              <field.DateTimeField
                label={t("kycForm.dob")}
                required={true}
                hideTime={true}
              />
            )}
          />
          <form.AppField
            name="country"
            children={(field) => (
              <field.CountrySelectField
                label={t("kycForm.country")}
                required={true}
              />
            )}
          />
          <form.AppField
            name="residencyStatus"
            children={(field) => (
              <field.SelectField
                label={t("kycForm.residencyStatus")}
                required={true}
                options={residencyStatusOptions}
              />
            )}
          />
          <form.AppField
            name="nationalId"
            children={(field) => (
              <field.TextField
                label={t("kycForm.nationalId")}
                required={true}
              />
            )}
          />
        </FormStepContent>
        <FormStepSubmit>
          <form.Subscribe
            selector={(state) => ({
              isDirty: state.isDirty,
              errors: state.errors,
              isValid: state.isValid,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ isDirty, errors, isValid, isSubmitting }) => (
              <Button
                type="button"
                className="press-effect"
                disabled={
                  isUpdatingKyc ||
                  isSubmitting ||
                  !isDirty ||
                  !isValid ||
                  Object.keys(errors).length > 0
                }
                onClick={() => {
                  void form.handleSubmit();
                }}
              >
                {t("kycForm.submit")}
              </Button>
            )}
          </form.Subscribe>
        </FormStepSubmit>
      </form.AppForm>
    </div>
  );
}
