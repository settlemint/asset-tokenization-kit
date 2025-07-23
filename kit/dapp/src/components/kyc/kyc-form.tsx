import { useAppForm } from "@/hooks/use-app-form";
import { authClient } from "@/lib/auth/auth.client";
import { isoCountryCode } from "@/lib/zod/validators/iso-country-code";
import {
  KycProfileUpsert,
  KycProfileUpsertSchema,
} from "@/orpc/routes/user/kyc/kyc.schema";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type FormValues = KycProfileUpsert & {
  country: string;
};

interface KycFormProps {
  onComplete: () => void;
}

const DEFAULT_VALUES: FormValues = {
  firstName: "",
  lastName: "",
  dob: new Date(1980, 0, 1),
  country: "",
  residencyStatus: "resident",
};

const KYC_FORM_FIELDS = [
  "firstName",
  "lastName",
  "dob",
  "country",
  "residencyStatus",
] as const;

const kycFormSchema = KycProfileUpsertSchema.extend({
  country: isoCountryCode,
});

export function KycForm({ onComplete }: KycFormProps) {
  const { t } = useTranslation(["components"]);
  const { data: session } = authClient.useSession();

  const form = useAppForm({
    defaultValues: session?.user.kycProfile ?? DEFAULT_VALUES,
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
      <form.StepSubmitButton
        label={t("kycForm.submit")}
        onStepSubmit={onComplete}
        validate={KYC_FORM_FIELDS}
      />
    </form.AppForm>
  );
}
