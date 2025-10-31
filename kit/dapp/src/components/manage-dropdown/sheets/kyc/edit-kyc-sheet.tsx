import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { FormStepContent } from "@/components/form/multi-step/form-step";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { useCountries } from "@/hooks/use-countries";
import { formatDate } from "@/lib/utils/date";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { KycReadOutput } from "@/orpc/routes/user/kyc/routes/kyc.read.schema";
import {
  KycUpsertInputSchema,
  type KycUpsertInput,
} from "@/orpc/routes/user/kyc/routes/kyc.upsert.schema";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../../core/action-form-sheet";
import { createActionFormStore } from "../../core/action-form-sheet.store";

interface EditKycSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  currentKyc: KycReadOutput;
}

const editableKeys: Array<
  keyof Pick<
    KycUpsertInput,
    | "firstName"
    | "lastName"
    | "dob"
    | "country"
    | "residencyStatus"
    | "nationalId"
  >
> = [
  "firstName",
  "lastName",
  "dob",
  "country",
  "residencyStatus",
  "nationalId",
];

export function EditKycSheet({
  open,
  onOpenChange,
  user,
  currentKyc,
}: EditKycSheetProps) {
  const { t } = useTranslation(["components", "user", "common"]);
  const queryClient = useQueryClient();
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));
  const { getCountryMap } = useCountries();

  const countryMap = useMemo(() => {
    const rawMap = getCountryMap();
    return Object.entries(rawMap).reduce<Record<string, string>>(
      (acc, [code, name]) => {
        acc[code.toUpperCase()] = name;
        return acc;
      },
      {}
    );
  }, [getCountryMap]);

  const baseValues = useMemo<KycUpsertInput>(
    () => ({
      id: currentKyc.id,
      userId: user.id,
      firstName: currentKyc.firstName,
      lastName: currentKyc.lastName,
      dob: new Date(currentKyc.dob),
      country: currentKyc.country,
      residencyStatus: currentKyc.residencyStatus,
      nationalId: currentKyc.nationalId,
      walletVerification: undefined,
    }),
    [currentKyc, user.id]
  );

  const form = useAppForm({
    defaultValues: baseValues,
    validators: {
      onChange: KycUpsertInputSchema,
    },
    onSubmit: () => {},
  });

  const resetSheetState = useCallback(() => {
    form.reset({
      ...baseValues,
    });
    sheetStoreRef.current.setState((state) => ({ ...state, step: "values" }));
  }, [baseValues, form]);

  useEffect(() => {
    if (open) {
      resetSheetState();
    }
  }, [open, resetSheetState]);

  const { mutateAsync: upsertKyc, isPending: isSubmitting } = useMutation(
    orpc.user.kyc.upsert.mutationOptions({
      onSuccess: async (_, variables) => {
        const readQuery = orpc.user.kyc.read.queryOptions({
          input: { userId: variables.userId },
        });

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.user.me.queryKey(),
            refetchType: "all",
          }),
          queryClient.invalidateQueries({
            queryKey: readQuery.queryKey,
          }),
        ]);
      },
    })
  );

  const formatCountry = useCallback(
    (code: string) => {
      if (!code) return code;
      const upper = code.toUpperCase();
      return countryMap[upper] ?? code;
    },
    [countryMap]
  );

  const formatResidencyStatus = useCallback(
    (status: string) =>
      t(`components:kycForm.residencyStatusOptions.${status}`, {
        defaultValue: status.replaceAll("_", " "),
      }),
    [t]
  );

  const residencyStatusOptions = useMemo(
    () =>
      ["resident", "non_resident", "dual_resident", "unknown"].map((value) => ({
        value,
        label: formatResidencyStatus(value),
      })),
    [formatResidencyStatus]
  );

  const handleClose = useCallback(() => {
    resetSheetState();
    onOpenChange(false);
  }, [onOpenChange, resetSheetState]);

  const handleSubmit = useCallback(
    (_walletVerification: UserVerification) => {
      const firstName = form.getFieldValue("firstName") as string | undefined;
      const lastName = form.getFieldValue("lastName") as string | undefined;
      const dob = form.getFieldValue("dob") as Date | undefined;
      const country = form.getFieldValue("country") as string | undefined;
      const residencyStatus = form.getFieldValue("residencyStatus") as
        | KycUpsertInput["residencyStatus"]
        | undefined;
      const nationalId = form.getFieldValue("nationalId") as string | undefined;

      const payload: KycUpsertInput = {
        id: baseValues.id,
        userId: baseValues.userId,
        firstName: firstName ?? baseValues.firstName,
        lastName: lastName ?? baseValues.lastName,
        dob: dob ?? baseValues.dob,
        country: country ?? baseValues.country,
        residencyStatus: residencyStatus ?? baseValues.residencyStatus,
        nationalId: nationalId ?? baseValues.nationalId,
      };

      const parsed = KycUpsertInputSchema.safeParse(payload);
      if (!parsed.success) {
        toast.error(
          parsed.error.issues[0]?.message ??
            t("common:error", { message: t("common:unknown") })
        );
        return;
      }

      toast
        .promise(upsertKyc(parsed.data), {
          loading: t("common:saving"),
          success: t("user:kyc.actions.upsert.success"),
          error: (error: Error) =>
            t("common:error", { message: error.message }),
        })
        .unwrap()
        .then(() => {
          handleClose();
        })
        .catch(() => undefined);
    },
    [baseValues, form, handleClose, t, upsertKyc]
  );

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values,
        errors: state.errors,
      })}
    >
      {({ values, errors }) => {
        const mergedValues: KycUpsertInput = {
          ...baseValues,
          ...values,
        };

        const errorKeys = Object.keys(errors ?? {});
        const hasFieldErrors = errorKeys.length > 0;

        const hasChanges = editableKeys.some((key) => {
          const currentValue = mergedValues[key];
          const initialValue = baseValues[key];
          if (key === "dob") {
            // Safely compare dates, handling null/undefined
            if (!currentValue || !initialValue) {
              return currentValue !== initialValue;
            }
            return currentValue instanceof Date && initialValue instanceof Date
              ? currentValue.getTime() !== initialValue.getTime()
              : currentValue !== initialValue;
          }

          if (
            typeof currentValue === "string" &&
            typeof initialValue === "string"
          ) {
            return currentValue.trim() !== initialValue.trim();
          }

          return currentValue !== initialValue;
        });

        const previousLabel = t("common:previous");

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("user:profile.editKyc.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DetailGrid title={t("user:profile.editKyc.title")}>
                <DetailGridItem label={t("components:kycForm.firstName")}>
                  <div className="space-y-1">
                    <span className="font-medium">
                      {mergedValues.firstName}
                    </span>
                    {mergedValues.firstName !== baseValues.firstName && (
                      <span className="text-xs text-muted-foreground">
                        {previousLabel}: {baseValues.firstName}
                      </span>
                    )}
                  </div>
                </DetailGridItem>
                <DetailGridItem label={t("components:kycForm.lastName")}>
                  <div className="space-y-1">
                    <span className="font-medium">{mergedValues.lastName}</span>
                    {mergedValues.lastName !== baseValues.lastName && (
                      <span className="text-xs text-muted-foreground">
                        {previousLabel}: {baseValues.lastName}
                      </span>
                    )}
                  </div>
                </DetailGridItem>
                <DetailGridItem label={t("components:kycForm.dob")}>
                  <div className="space-y-1">
                    <span className="font-medium">
                      {formatDate(mergedValues.dob)}
                    </span>
                    {mergedValues.dob &&
                      baseValues.dob &&
                      mergedValues.dob.getTime() !==
                        baseValues.dob.getTime() && (
                        <span className="text-xs text-muted-foreground">
                          {previousLabel}: {formatDate(baseValues.dob)}
                        </span>
                      )}
                  </div>
                </DetailGridItem>
                <DetailGridItem label={t("components:kycForm.country")}>
                  <div className="space-y-1">
                    <span className="font-medium">
                      {formatCountry(mergedValues.country)}
                    </span>
                    {mergedValues.country !== baseValues.country && (
                      <span className="text-xs text-muted-foreground">
                        {previousLabel}: {formatCountry(baseValues.country)}
                      </span>
                    )}
                  </div>
                </DetailGridItem>
                <DetailGridItem label={t("components:kycForm.residencyStatus")}>
                  <div className="space-y-1">
                    <span className="font-medium">
                      {formatResidencyStatus(mergedValues.residencyStatus)}
                    </span>
                    {mergedValues.residencyStatus !==
                      baseValues.residencyStatus && (
                      <span className="text-xs text-muted-foreground">
                        {previousLabel}:{" "}
                        {formatResidencyStatus(baseValues.residencyStatus)}
                      </span>
                    )}
                  </div>
                </DetailGridItem>
                <DetailGridItem label={t("components:kycForm.nationalId")}>
                  <div className="space-y-1">
                    <span className="font-medium">
                      {mergedValues.nationalId}
                    </span>
                    {mergedValues.nationalId !== baseValues.nationalId && (
                      <span className="text-xs text-muted-foreground">
                        {previousLabel}: {baseValues.nationalId}
                      </span>
                    )}
                  </div>
                </DetailGridItem>
              </DetailGrid>
            </CardContent>
          </Card>
        );

        const canContinue = () => hasChanges && !hasFieldErrors;

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={handleClose}
            title={t("user:profile.editKyc.title")}
            description={t("user:profile.editKyc.description")}
            submitLabel={t("common:save")}
            isSubmitting={isSubmitting}
            disabled={() => isSubmitting}
            canContinue={canContinue}
            onSubmit={handleSubmit}
            store={sheetStoreRef.current}
            showAssetDetailsOnConfirm={false}
            confirm={confirmView}
          >
            <div className="space-y-6">
              <FormStepContent asGrid fullWidth>
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
                      options={residencyStatusOptions}
                      required
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
              </FormStepContent>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
