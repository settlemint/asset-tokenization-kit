import { useAppForm } from "@/hooks/use-app-form";
import { authClient } from "@/lib/auth/auth.client";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { KycProfileUpsert } from "@/orpc/routes/user/kyc/kyc.schema";
import { KycProfileUpsertSchema } from "@/orpc/routes/user/kyc/kyc.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export type KycFormValues = KycProfileUpsert & {
  verification?: UserVerification;
};

interface KycFormProps {
  onComplete: () => void | Promise<void>;
}

export function KycForm({ onComplete }: KycFormProps) {
  const { t } = useTranslation(["components"]);
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const shouldRegisterIdentity = session?.user.role === "admin";

  const { mutateAsync: registerIdentity, isPending: _isRegisteringIdentity } =
    useMutation(
      orpc.system.identityRegister.mutationOptions({
        onSuccess: async () => {
          // Refetch all relevant data
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: orpc.account.me.queryOptions().queryKey,
              refetchType: "all",
            }),
            queryClient.invalidateQueries({
              queryKey: orpc.user.me.queryOptions().queryKey,
              refetchType: "all",
            }),
          ]);
        },
      })
    );

  const { mutateAsync: updateKyc, isPending: _isUpdatingKyc } = useMutation(
    orpc.user.kyc.upsert.mutationOptions({
      onSuccess: async () => {
        // Invalidate user data to update sidebar and dropdown
        await queryClient.invalidateQueries({
          queryKey: orpc.user.me.queryOptions().queryKey,
          refetchType: "all",
        });
        await onComplete();
      },
    })
  );

  const { data: kyc } = useQuery(
    orpc.user.kyc.read.queryOptions({
      input: {
        userId: session?.user.id ?? "",
      },
      enabled: !!session?.user.id,
      // If it fails, the account is not yet created, so we don't want to retry
      retry: false,
      throwOnError: false,
    })
  );

  const form = useAppForm({
    defaultValues: {
      ...kyc,
    } as KycFormValues,
    validators: {
      onChange: KycProfileUpsertSchema,
    },
    onSubmit: ({ value }) => {
      const promise = async () => {
        if (shouldRegisterIdentity) {
          if (!value.verification) {
            throw new Error("Verification is required");
          }

          await registerIdentity({
            country: value.country,
            verification: value.verification,
          });
        }

        await updateKyc({
          ...value,
          userId: session?.user.id ?? "",
        });
      };

      toast.promise(promise(), {
        loading: t("kycForm.identity.deploying-toast"),
        success: t("kycForm.identity.deployed-toast"),
        error: (error: Error) =>
          `${t("kycForm.identity.failed-toast")}${error.message}`,
      });
    },
  });

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
            <field.TextField label={t("kycForm.nationalId")} required={true} />
          )}
        />
        <form.VerificationButton
          verification={{
            title: t("kycForm.identity.confirm-title"),
            description: t("kycForm.identity.confirm-description"),
            setField: (verification) => {
              form.setFieldValue("verification", verification);
            },
          }}
          disabled={({ isDirty, errors }) => {
            return !isDirty || Object.keys(errors).length > 0;
          }}
          onSubmit={() => {
            void form.handleSubmit();
          }}
        >
          {t("kycForm.submit")}
        </form.VerificationButton>
      </form.AppForm>
    </div>
  );
}
