import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppForm } from "@/hooks/use-app-form";
import { getErrorCode, isORPCError } from "@/hooks/use-error-info";
import { orpc } from "@/orpc/orpc-client";
import {
  KycUpsertInputSchema,
  type KycUpsertInput,
} from "@/orpc/routes/user/kyc/routes/kyc.upsert.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type InlineKycFormValues = {
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  dob?: Date;
  country: string;
  residencyStatus: KycUpsertInput["residencyStatus"];
  nationalId: string;
};

interface ProfileKycCardProps {
  userId: string;
}

export function ProfileKycCard({ userId }: ProfileKycCardProps) {
  const { t } = useTranslation(["user", "common"]);

  const {
    data: kyc,
    isPending: isKycLoading,
    error: kycError,
  } = useQuery(
    orpc.user.kyc.read.queryOptions({
      input: { userId },
      enabled: Boolean(userId),
      throwOnError: false,
    })
  );

  const queryClient = useQueryClient();

  const { mutateAsync: upsertKyc, isPending: isSavingKyc } = useMutation(
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

  const baseKycValues = useMemo<InlineKycFormValues>(
    () => ({
      id: kyc?.id,
      userId,
      firstName: kyc?.firstName ?? "",
      lastName: kyc?.lastName ?? "",
      dob: kyc?.dob ? new Date(kyc.dob) : undefined,
      country: kyc?.country ?? "",
      residencyStatus: kyc?.residencyStatus ?? "resident",
      nationalId: kyc?.nationalId ?? "",
    }),
    [
      kyc?.country,
      kyc?.dob,
      kyc?.firstName,
      kyc?.id,
      kyc?.lastName,
      kyc?.nationalId,
      kyc?.residencyStatus,
      userId,
    ]
  );

  const kycForm = useAppForm({
    defaultValues: baseKycValues,
    validators: {
      onChange: KycUpsertInputSchema,
    },
    onSubmit: ({ value }) => {
      const payload = {
        id: value.id,
        userId,
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        dob: value.dob,
        country: value.country,
        residencyStatus: value.residencyStatus,
        nationalId: value.nationalId.trim(),
      } satisfies Partial<KycUpsertInput>;

      const parsed = KycUpsertInputSchema.safeParse(payload);

      if (!parsed.success) {
        toast.error(
          parsed.error.issues[0]?.message ??
            t("common:error", { message: t("common:unknown") })
        );
        return;
      }

      const promise = upsertKyc(parsed.data);

      void toast.promise(promise, {
        loading: t("common:saving"),
        success: t("profile.kyc.actions.success"),
        error: (error: Error) => t("common:error", { message: error.message }),
      });
    },
  });

  useEffect(() => {
    kycForm.reset(baseKycValues);
  }, [baseKycValues, kycForm]);

  const residencyStatusOptions = useMemo(
    () =>
      (["resident", "non_resident", "dual_resident", "unknown"] as const).map(
        (status) => ({
          value: status,
          label: t(`profile.kyc.residencyStatusOptions.${status}`),
        })
      ),
    [t]
  );

  const skeletonFields = useMemo(
    () => [
      { id: "firstName", label: t("profile.kyc.fields.firstName") },
      { id: "lastName", label: t("profile.kyc.fields.lastName") },
      { id: "dob", label: t("profile.kyc.fields.dob") },
      { id: "country", label: t("profile.kyc.fields.country") },
      {
        id: "residencyStatus",
        label: t("profile.kyc.fields.residencyStatus"),
      },
      { id: "nationalId", label: t("profile.kyc.fields.nationalId") },
    ],
    [t]
  );

  const isMissingKycProfile = useMemo(() => {
    if (!kycError) return false;

    const status = getErrorCode(kycError);
    if (status === 404 || status === "404") return true;

    const codeCandidate = isORPCError(kycError)
      ? kycError.code
      : typeof kycError === "object" && kycError !== null
        ? (kycError as { code?: unknown }).code
        : undefined;

    if (typeof codeCandidate === "string") {
      const normalized = codeCandidate.toUpperCase();
      return normalized === "NOT_FOUND" || normalized.endsWith("_NOT_FOUND");
    }

    return false;
  }, [kycError]);

  const showKycError = Boolean(kycError && !kyc && !isMissingKycProfile);

  const editableKycKeys: Array<keyof InlineKycFormValues> = [
    "firstName",
    "lastName",
    "dob",
    "country",
    "residencyStatus",
    "nationalId",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("details.kycInformation")}</CardTitle>
        <CardDescription>{t("profile.kyc.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {showKycError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {t("profile.messages.genericError")}
            </AlertDescription>
          </Alert>
        ) : isKycLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {skeletonFields.map(({ id, label }) => (
              <div key={id} className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {label}
                </p>
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <kycForm.Subscribe
            selector={(state) => ({
              values: state.values as Partial<InlineKycFormValues>,
              errors: state.errors,
            })}
          >
            {({ values, errors }) => {
              const mergedValues = {
                ...baseKycValues,
                ...values,
              } as InlineKycFormValues;

              const errorKeys = Object.keys(errors ?? {});
              const hasFieldErrors = errorKeys.length > 0;

              const hasChanges = editableKycKeys.some((key) => {
                const currentValue = mergedValues[key];
                const initialValue = baseKycValues[key];

                if (key === "dob") {
                  if (!currentValue || !initialValue) {
                    return Boolean(currentValue) !== Boolean(initialValue);
                  }

                  const currentDate = currentValue as Date;
                  const initialDate = initialValue as Date;
                  return currentDate.getTime() !== initialDate.getTime();
                }

                if (
                  typeof currentValue === "string" &&
                  typeof initialValue === "string"
                ) {
                  return currentValue.trim() !== initialValue.trim();
                }

                return currentValue !== initialValue;
              });

              return (
                <kycForm.AppForm>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <kycForm.AppField name="firstName">
                      {(field) => (
                        <field.TextField
                          label={t("profile.kyc.fields.firstName")}
                          required
                        />
                      )}
                    </kycForm.AppField>
                    <kycForm.AppField name="lastName">
                      {(field) => (
                        <field.TextField
                          label={t("profile.kyc.fields.lastName")}
                          required
                        />
                      )}
                    </kycForm.AppField>
                    <kycForm.AppField name="dob">
                      {(field) => (
                        <field.DateTimeField
                          label={t("profile.kyc.fields.dob")}
                          required
                          hideTime
                        />
                      )}
                    </kycForm.AppField>
                    <kycForm.AppField name="country">
                      {(field) => (
                        <field.CountrySelectField
                          label={t("profile.kyc.fields.country")}
                          required
                        />
                      )}
                    </kycForm.AppField>
                    <kycForm.AppField name="residencyStatus">
                      {(field) => (
                        <field.SelectField
                          label={t("profile.kyc.fields.residencyStatus")}
                          options={residencyStatusOptions}
                          required
                        />
                      )}
                    </kycForm.AppField>
                    <kycForm.AppField name="nationalId">
                      {(field) => (
                        <field.TextField
                          label={t("profile.kyc.fields.nationalId")}
                          required
                        />
                      )}
                    </kycForm.AppField>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => {
                        void kycForm.handleSubmit();
                      }}
                      disabled={isSavingKyc || hasFieldErrors || !hasChanges}
                    >
                      {isSavingKyc ? t("common:saving") : t("common:save")}
                    </Button>
                  </div>
                </kycForm.AppForm>
              );
            }}
          </kycForm.Subscribe>
        )}
      </CardContent>
    </Card>
  );
}
