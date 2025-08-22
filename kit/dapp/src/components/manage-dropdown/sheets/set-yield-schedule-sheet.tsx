import { isRequiredField } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { useCountries } from "@/hooks/use-countries";
import { formatValue } from "@/lib/utils/format-value";
import { isTimeInterval } from "@atk/zod/time-interval";
import { orpc } from "@/orpc/orpc-client";
import { FixedYieldScheduleCreateInput } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.create.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { basisPointsToPercentage } from "@atk/zod/basis-points";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

/**
 * Props for the SetYieldScheduleSheet component.
 */
interface SetYieldScheduleSheetProps {
  /** Controls sheet visibility */
  open: boolean;
  /** Callback when sheet open state changes */
  onOpenChange: (open: boolean) => void;
  /** Token to create yield schedule for */
  asset: Token;
}

/**
 * Set yield schedule interface for bond tokens.
 *
 * @remarks
 * BUSINESS LOGIC: Implements yield schedule creation and association workflow
 * that follows a two-step process:
 * 1. Create the fixed yield schedule contract
 * 2. Associate it with the token contract
 *
 * VALIDATION: Ensures dates are logical, rates are reasonable, and intervals
 * are appropriate for the duration.
 *
 * SECURITY: Requires wallet verification for both contract creation and
 * token association to prevent unauthorized yield schedule setup.
 */
export function SetYieldScheduleSheet({
  open,
  onOpenChange,
  asset,
}: SetYieldScheduleSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();
  const { getCountryByNumericCode } = useCountries();

  // Create yield schedule mutation
  const { mutateAsync: createYieldSchedule, isPending: isCreating } =
    useMutation(orpc.fixedYieldSchedule.create.mutationOptions());

  // Set yield schedule on token mutation
  const { mutateAsync: setYieldSchedule, isPending: isSetting } = useMutation(
    orpc.token.setYieldSchedule.mutationOptions({
      onSuccess: async () => {
        // Refresh token data to show updated yield schedule
        await qc.invalidateQueries({
          queryKey: orpc.token.read.queryOptions({
            input: { tokenAddress: asset.id },
          }).queryKey,
        });
      },
    })
  );

  const isSubmitting = isCreating || isSetting;

  // Store for stepper state
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  // Form initialization
  const form = useAppForm({
    defaultValues: {} as FixedYieldScheduleCreateInput,
  });

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      form.reset();
      sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    }
  }, [open, form]);

  // Handle form submission
  const handleSubmit = async (verification: {
    secretVerificationCode: string;
    verificationType?: "OTP" | "PINCODE" | "SECRET_CODES";
  }) => {
    const values = form.state.values;
    toast.loading(t("tokens:actions.setYieldSchedule.messages.preparing"));
    try {
      // Step 1: Create the yield schedule
      const scheduleResult = await createYieldSchedule({
        yieldRate: values.yieldRate,
        paymentInterval: values.paymentInterval,
        startTime: values.startTime,
        endTime: values.endTime,
        token: asset.id,
        countryCode: values.countryCode.toString(),
        walletVerification: {
          secretVerificationCode: verification.secretVerificationCode,
          verificationType: verification.verificationType || "PINCODE",
        },
      });

      // Step 2: Set the yield schedule on the token
      await setYieldSchedule({
        contract: asset.id,
        schedule: scheduleResult.address,
        walletVerification: {
          secretVerificationCode: verification.secretVerificationCode,
          verificationType: verification.verificationType || "PINCODE",
        },
      });

      toast.success(t("tokens:actions.setYieldSchedule.messages.success"));
      onOpenChange(false);
    } catch {
      toast.error(t("tokens:actions.setYieldSchedule.messages.failed"));
    }
  };

  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => (
        <ActionFormSheet
          open={open}
          onOpenChange={onOpenChange}
          asset={asset}
          title={t("tokens:actions.setYieldSchedule.title")}
          description={t("tokens:actions.setYieldSchedule.description")}
          submitLabel={t("tokens:actions.setYieldSchedule.submit")}
          isSubmitting={isSubmitting}
          canContinue={() => {
            return form.state.isDirty && form.state.errors.length === 0;
          }}
          onSubmit={handleSubmit}
          store={sheetStoreRef.current}
          confirm={
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("tokens:actions.setYieldSchedule.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("tokens:yield.fields.startDate")}
                      </div>
                      <div className="text-sm font-medium">
                        {values.startTime
                          ? formatValue(values.startTime, { type: "date" })
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("tokens:yield.fields.endDate")}
                      </div>
                      <div className="text-sm font-medium">
                        {values.endTime
                          ? formatValue(values.endTime, { type: "date" })
                          : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("tokens:yield.fields.rate")}
                      </div>
                      <div className="text-sm font-medium">
                        {values.yieldRate
                          ? formatValue(
                              basisPointsToPercentage(values.yieldRate),
                              { type: "percentage" }
                            )
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("tokens:yield.fields.interval")}
                      </div>
                      <div className="text-sm font-medium">
                        {values.paymentInterval
                          ? getTimeIntervalLabel(values.paymentInterval)
                          : "—"}
                      </div>
                    </div>
                  </div>

                  {values.countryCode && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("tokens:yield.fields.country")}
                      </div>
                      <div className="text-sm font-medium">
                        {getCountryByNumericCode(values.countryCode) || "—"}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          }
        >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <form.AppField
              name="startTime"
              children={(field) => (
                <field.DateTimeField
                  label={t("tokens:yield.fields.startDate")}
                  required={true}
                  minDate={new Date()}
                />
              )}
            />

            <form.Subscribe selector={(state) => state.values.startTime}>
              {(startTime) => {
                return (
                  <form.AppField
                    name="endTime"
                    children={(field) => (
                      <field.DateTimeField
                        label={t("tokens:yield.fields.endDate")}
                        required={true}
                        minDate={startTime ?? new Date()}
                      />
                    )}
                  />
                );
              }}
            </form.Subscribe>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Yield Rate */}
            <div>
              <form.AppField
                name="yieldRate"
                children={(field) => (
                  <field.NumberField
                    label={t("tokens:yield.fields.rate")}
                    endAddon="bps"
                    required={true}
                    description={t("tokens:yield.fields.rateInfo")}
                  />
                )}
              />
              <form.Subscribe
                selector={(state) => ({
                  yieldRate:
                    state.errors?.length === 0
                      ? state.values.yieldRate
                      : undefined,
                })}
              >
                {({ yieldRate }) => {
                  if (!yieldRate) return null;
                  const percentage = formatValue(
                    basisPointsToPercentage(yieldRate),
                    {
                      type: "percentage",
                    }
                  );
                  return (
                    <div className="ml-1 text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      {t("tokens:yield.fields.rateInPercentage")} {percentage}
                    </div>
                  );
                }}
              </form.Subscribe>
            </div>

            {/* Payment Interval */}
            <form.AppField
              name="paymentInterval"
              children={(field) => (
                <field.SelectTimeIntervalField
                  label={t("tokens:yield.fields.interval")}
                  required={true}
                  description={t("tokens:yield.fields.intervalInfo")}
                  placeholder={t("tokens:yield.form.selectInterval")}
                />
              )}
            />
          </div>

          <form.AppField
            name="countryCode"
            children={(field) => (
              <field.CountrySelectField
                label={t("tokens:yield.fields.country")}
                required={isRequiredField("countryCode")}
                valueType="numeric"
                description={t("tokens:yield.fields.countryInfo")}
              />
            )}
          />
        </div>
      </ActionFormSheet>
      )}
    </form.Subscribe>
  );
}
