import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { ActionFormSheet } from "@/components/manage-dropdown/core/action-form-sheet";
import { createActionFormStore } from "@/components/manage-dropdown/core/action-form-sheet.store";
import { useCountries } from "@/hooks/use-countries";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import {
  KycUpsertInputSchema,
  type KycUpsertOutput,
} from "@/orpc/routes/user/kyc/routes/kyc.upsert.schema";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { toast } from "sonner";

export type EditKycSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialKyc: KycUpsertOutput | null;
};

type EditKycFormValues = {
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  dob?: Date;
  country: string;
  residencyStatus?: string;
  nationalId: string;
  verification?: UserVerification;
};

function buildDefaultValues(
  userId: string,
  initialKyc: KycUpsertOutput | null
): EditKycFormValues {
  return {
    id: initialKyc?.id,
    userId,
    firstName: initialKyc?.firstName ?? "",
    lastName: initialKyc?.lastName ?? "",
    dob: initialKyc?.dob ? new Date(initialKyc.dob) : undefined,
    country: initialKyc?.country ?? "",
    residencyStatus: initialKyc?.residencyStatus ?? undefined,
    nationalId: initialKyc?.nationalId ?? "",
    verification: undefined,
  };
}

export function EditKycSheet({
  open,
  onOpenChange,
  userId,
  initialKyc,
}: EditKycSheetProps) {
  const { t } = useTranslation(["user", "components", "common"]);
  const queryClient = useQueryClient();
  const { getCountryMap } = useCountries();
  const countryMap = useMemo(() => getCountryMap(), [getCountryMap]);
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  const form = useAppForm<EditKycFormValues>({
    defaultValues: buildDefaultValues(userId, initialKyc),
    validators: {
      onChange: KycUpsertInputSchema,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaultValues(userId, initialKyc));
      sheetStoreRef.current.setState((state) => ({ ...state, step: "values" }));
    }
  }, [open, initialKyc, userId, form]);

  const { mutateAsync: upsertKyc, isPending } = useMutation(
    orpc.user.kyc.upsert.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.user.me.queryKey(),
            refetchType: "all",
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.user.kyc.read.queryKey({
              input: { userId },
            }),
          }),
        ]);
        onOpenChange(false);
      },
    })
  );

  const residencyStatusOptions = useMemo(
    () => [
      {
        label: t("components:kycForm.residencyStatusOptions.resident"),
        value: "resident",
      },
      {
        label: t("components:kycForm.residencyStatusOptions.non_resident"),
        value: "non_resident",
      },
      {
        label: t("components:kycForm.residencyStatusOptions.dual_resident"),
        value: "dual_resident",
      },
      {
        label: t("components:kycForm.residencyStatusOptions.unknown"),
        value: "unknown",
      },
    ],
    [t]
  );

  const handleSubmit = (values: EditKycFormValues) => {
    const dobValue =
      values.dob instanceof Date
        ? values.dob
        : values.dob
          ? new Date(values.dob)
          : undefined;

    const payload = {
      id: values.id,
      userId,
      firstName: values.firstName ?? "",
      lastName: values.lastName ?? "",
      dob: dobValue,
      country: values.country ?? "",
      residencyStatus: values.residencyStatus,
      nationalId: values.nationalId ?? "",
    };

    const parsed = KycUpsertInputSchema.safeParse(payload);

    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    void toast.promise(upsertKyc(parsed.data), {
      loading: t("common:saving"),
      success: t("user:kyc.actions.upsert.success"),
      error: (error: Error) =>
        t("common:error", { message: error.message ?? "" }),
    });
  };

  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => {
        const dobValue =
          values.dob instanceof Date
            ? values.dob
            : values.dob
              ? new Date(values.dob)
              : undefined;
        const countryCode = values.country
          ? values.country.toUpperCase()
          : undefined;
        const countryLabel = countryCode
          ? (countryMap[countryCode] ?? countryCode)
          : t("common:none");
        const residencyLabel = values.residencyStatus
          ? t(
              `components:kycForm.residencyStatusOptions.${values.residencyStatus}`,
              {
                defaultValue: values.residencyStatus.replaceAll("_", " "),
              }
            )
          : t("common:none");

        const canContinue = KycUpsertInputSchema.safeParse({
          id: values.id,
          userId,
          firstName: values.firstName,
          lastName: values.lastName,
          dob: dobValue,
          country: values.country,
          residencyStatus: values.residencyStatus,
          nationalId: values.nationalId,
        }).success;

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                sheetStoreRef.current.setState((state) => ({
                  ...state,
                  step: "values",
                }));
                onOpenChange(false);
              } else {
                onOpenChange(true);
              }
            }}
            title={t("user:profile.editKyc", { defaultValue: "Edit KYC" })}
            description={t("components:kycForm.identity.confirm-description")}
            submitLabel={t("components:kycForm.submit")}
            isSubmitting={isPending}
            disabled={({ errors }) =>
              isPending || Object.keys(errors).length > 0
            }
            canContinue={() => canContinue}
            onSubmit={() => {
              handleSubmit(values as EditKycFormValues);
            }}
            store={sheetStoreRef.current}
            showAssetDetailsOnConfirm={false}
            confirm={
              <ConfirmKycView
                values={values as EditKycFormValues}
                dob={dobValue}
                countryLabel={countryLabel}
                residencyLabel={residencyLabel}
                t={t}
              />
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.AppField name="firstName">
                {(field) => (
                  <field.TextField
                    label={t("components:kycForm.firstName")}
                    required
                  />
                )}
              </form.AppField>
              <form.AppField name="lastName">
                {(field) => (
                  <field.TextField
                    label={t("components:kycForm.lastName")}
                    required
                  />
                )}
              </form.AppField>
              <form.AppField name="dob">
                {(field) => (
                  <field.DateTimeField
                    label={t("components:kycForm.dob")}
                    required
                    hideTime
                  />
                )}
              </form.AppField>
              <form.AppField name="country">
                {(field) => (
                  <field.CountrySelectField
                    label={t("components:kycForm.country")}
                    required
                  />
                )}
              </form.AppField>
              <form.AppField name="residencyStatus">
                {(field) => (
                  <field.SelectField
                    label={t("components:kycForm.residencyStatus")}
                    required
                    options={residencyStatusOptions}
                  />
                )}
              </form.AppField>
              <form.AppField name="nationalId">
                {(field) => (
                  <field.TextField
                    label={t("components:kycForm.nationalId")}
                    required
                  />
                )}
              </form.AppField>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}

interface ConfirmKycViewProps {
  values: EditKycFormValues;
  dob?: Date;
  countryLabel: string;
  residencyLabel: string;
  t: TFunction;
}

function ConfirmKycView({
  values,
  dob,
  countryLabel,
  residencyLabel,
  t,
}: ConfirmKycViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <DetailGridItem
        label={t("components:kycForm.firstName")}
        value={values.firstName}
        emptyValue="-"
      />
      <DetailGridItem
        label={t("components:kycForm.lastName")}
        value={values.lastName}
        emptyValue="-"
      />
      <DetailGridItem
        label={t("components:kycForm.dob")}
        value={dob}
        type="date"
        emptyValue="-"
      />
      <DetailGridItem
        label={t("components:kycForm.country")}
        value={countryLabel}
        emptyValue="-"
      />
      <DetailGridItem
        label={t("components:kycForm.residencyStatus")}
        value={residencyLabel}
        emptyValue="-"
      />
      <DetailGridItem
        label={t("components:kycForm.nationalId")}
        value={values.nationalId}
        emptyValue="-"
      />
    </div>
  );
}
