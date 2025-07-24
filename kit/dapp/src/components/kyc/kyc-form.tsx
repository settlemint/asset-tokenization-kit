import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/use-app-form";
import { authClient } from "@/lib/auth/auth.client";
import { orpc } from "@/orpc/orpc-client";
import {
  KycProfileUpsert,
  KycProfileUpsertSchema,
} from "@/orpc/routes/user/kyc/kyc.schema";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type KycFormValues = KycProfileUpsert;

interface KycFormProps {
  disabled?: boolean;
  onComplete: (values: KycFormValues) => void;
}

export function KycForm({ onComplete, disabled }: KycFormProps) {
  const { t } = useTranslation(["components"]);
  const { data: session } = authClient.useSession();

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
    defaultValues: {
      ...kyc,
    } as KycFormValues,
    validators: {
      onChange: KycProfileUpsertSchema,
    },
    onSubmit: ({ value }) => {
      onComplete(value);
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
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
            <field.TextField label={t("kycForm.nationalId")} />
          )}
        />
        <Button type="submit" disabled={disabled}>
          {t("kycForm.submit")}
        </Button>
      </form.AppForm>
    </form>
  );
}
