import { useAppForm } from "@/hooks/use-app-form";
import { authClient } from "@/lib/auth/auth.client";
import {
  getCountryName,
  type SupportedLocale,
} from "@/lib/zod/validators/iso-country-code";
import { orpc } from "@/orpc/orpc-client";
import {
  KycProfileUpsert,
  KycProfileUpsertSchema,
} from "@/orpc/routes/user/kyc/kyc.schema";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type FormValues = KycProfileUpsert;

interface KycFormProps {
  onComplete: () => void;
}

const KYC_FORM_FIELDS = [
  "firstName",
  "lastName",
  "dob",
  "residencyStatus",
] as const;

const kycFormSchema = KycProfileUpsertSchema;

export function KycForm({ onComplete }: KycFormProps) {
  const { t, i18n } = useTranslation(["components"]);
  const { data: session } = authClient.useSession();

  const { data: account } = useQuery({
    ...orpc.account.me.queryOptions(),
  });
  const { data: kyc } = useQuery({
    ...orpc.user.kyc.read.queryOptions({
      input: {
        userId: session?.user.id ?? "",
      },
      enabled: !!session?.user.id,
      retry: false,
      throwOnError: false,
    }),
  });

  const form = useAppForm({
    defaultValues: kyc as FormValues,
    validators: {
      onChange: kycFormSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
      onComplete();
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
        name="residencyStatus"
        children={(field) => (
          <field.SelectField
            label={t("kycForm.residencyStatus")}
            description={t("kycForm.residencyStatusDescription", {
              country: getCountryName(
                account?.country ?? "",
                i18n.language as SupportedLocale
              ),
            })}
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
      <form.StepSubmitButton
        label={t("kycForm.submit")}
        onStepSubmit={onComplete}
        validate={KYC_FORM_FIELDS}
      />
    </form.AppForm>
  );
}
