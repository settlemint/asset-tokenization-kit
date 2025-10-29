import { FormStepContent } from "@/components/form/multi-step/form-step";
import { useAppForm } from "@/hooks/use-app-form";
import { useSession } from "@/hooks/use-auth";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { KycUpsertInput } from "@/orpc/routes/user/kyc/routes/kyc.upsert.schema";
import { KycUpsertInputSchema } from "@/orpc/routes/user/kyc/routes/kyc.upsert.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

/**
 * Extended KYC form values that include optional wallet verification for admin operations.
 *
 * @remarks
 * SECURITY: walletVerification is only required when user has admin role and needs to register
 * a new identity on-chain. Regular KYC updates don't require blockchain verification.
 */
export type KycFormValues = KycUpsertInput & {
  walletVerification?: UserVerification;
};

/**
 * Props for the KYC (Know Your Customer) form component.
 */
interface KycFormProps {
  /** Callback executed after successful KYC completion and any necessary identity registration */
  onComplete: () => void | Promise<void>;
  /** Optional callback executed when user skips the KYC form */
  onSkip?: () => void | Promise<void>;
}

/**
 * KYC (Know Your Customer) form component that handles identity verification and compliance.
 *
 * @remarks
 * COMPLIANCE: Collects mandatory identity information required for financial regulations
 * and anti-money laundering (AML) compliance in asset tokenization platforms.
 *
 * ROLE-BASED BEHAVIOR:
 * - Admin users: Triggers on-chain identity registration via smart contract
 * - Regular users: Updates KYC data in application database only
 *
 * SECURITY: Uses wallet verification for admin operations to prevent unauthorized
 * identity registrations on the blockchain, which could have regulatory implications.
 *
 * PERFORMANCE: Optimistically invalidates related queries on success to maintain
 * consistent UI state across user profile, sidebar, and dropdown components.
 *
 * @param onComplete - Callback executed after successful KYC submission and identity registration
 */
export function KycForm({ onComplete, onSkip }: KycFormProps) {
  const { t } = useTranslation(["components", "common"]);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // RBAC: Only admin users can register new identities on-chain
  // Regular users update KYC data without blockchain interaction
  const shouldRegisterIdentity = session?.user.role === "admin";

  // BLOCKCHAIN: Mutation for registering new identity smart contract
  const { mutateAsync: registerIdentity, isPending: isRegisteringIdentity } =
    useMutation(
      orpc.system.identity.register.mutationOptions({
        onSuccess: async () => {
          // PERFORMANCE: Invalidate both account and user queries to refresh UI
          // Account query updates blockchain-related data, user query updates profile
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: orpc.system.identity.me.queryKey(),
              refetchType: "all",
            }),
            queryClient.invalidateQueries({
              queryKey: orpc.user.me.queryKey(),
              refetchType: "all",
            }),
          ]);
        },
      })
    );

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
    } as KycFormValues,
    validators: {
      // VALIDATION: Real-time validation on form changes using Zod schema
      onChange: KycUpsertInputSchema,
    },
    onSubmit: ({ value }) => {
      const promise = async () => {
        // CONDITIONAL: Only register identity on-chain for admin users
        if (shouldRegisterIdentity) {
          // SECURITY: Ensure wallet verification is present before blockchain operation
          if (!value.walletVerification) {
            throw new Error("Verification is required");
          }

          // BLOCKCHAIN: Register new identity smart contract with country and verification
          await registerIdentity({
            country: value.country,
            walletVerification: value.walletVerification,
          });
        }

        // DATABASE: Always update KYC data in application database
        // This happens after identity registration to ensure proper sequencing
        await updateKyc({
          ...value,
          userId: session?.user.id ?? "",
        });
      };

      // UX: Provide user feedback during the async operation
      // Different messages for identity deployment vs regular KYC update
      toast.promise(promise(), {
        loading: t("kycForm.identity.deploying-toast"),
        success: t("kycForm.identity.deployed-toast"),
        error: (error: Error) =>
          `${t("kycForm.identity.failed-toast")}${error.message}`,
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
              <field.TextField label={t("kycForm.firstName")} required={false} />
            )}
          />
          <form.AppField
            name="lastName"
            children={(field) => (
              <field.TextField label={t("kycForm.lastName")} required={false} />
            )}
          />
          <form.AppField
            name="dob"
            children={(field) => (
              <field.DateTimeField
                label={t("kycForm.dob")}
                required={false}
                hideTime={true}
              />
            )}
          />
          <form.AppField
            name="country"
            children={(field) => (
              <field.CountrySelectField
                label={t("kycForm.country")}
                required={false}
              />
            )}
          />
          <form.AppField
            name="residencyStatus"
            children={(field) => (
              <field.SelectField
                label={t("kycForm.residencyStatus")}
                required={false}
                options={residencyStatusOptions}
              />
            )}
          />
          <form.AppField
            name="nationalId"
            children={(field) => (
              <field.TextField
                label={t("kycForm.nationalId")}
                required={false}
              />
            )}
          />
        </FormStepContent>
        <div className="flex flex-col gap-4">
          <form.VerificationButton
            walletVerification={{
              title: t("kycForm.identity.confirm-title"),
              description: t("kycForm.identity.confirm-description"),
              setField: (verification) => {
                form.setFieldValue("walletVerification", verification);
              },
            }}
            disabled={({ isDirty, errors }) => {
              return (
                // LOADING: Prevent double-submission during async operations
                isRegisteringIdentity ||
                isUpdatingKyc ||
                // UX: Only enable when user has made changes to the form
                !isDirty ||
                // VALIDATION: Block submission if any validation errors exist
                Object.keys(errors).length > 0
              );
            }}
            onSubmit={() => {
              void form.handleSubmit();
            }}
          >
            {t("kycForm.submit")}
          </form.VerificationButton>
          {onSkip && (
            <form.subscribe
              selector={(state) => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <button
                  type="button"
                  onClick={() => {
                    void onSkip();
                  }}
                  disabled={isSubmitting || isRegisteringIdentity || isUpdatingKyc}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common:actions.skip")}
                </button>
              )}
            />
          )}
        </div>
      </form.AppForm>
    </div>
  );
}
