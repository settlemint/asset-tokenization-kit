import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "dnum";
import { useEffect, useMemo, useRef } from "react";
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
 * Payment interval options with their corresponding values in seconds
 */
const PAYMENT_INTERVALS = [
  { label: "Daily", value: "86400", seconds: 86_400 }, // 1 day
  { label: "Weekly", value: "604800", seconds: 604_800 }, // 7 days
  { label: "Monthly", value: "2629746", seconds: 2_629_746 }, // 30.44 days (average month)
  { label: "Quarterly", value: "7889238", seconds: 7_889_238 }, // ~91.33 days
  { label: "Yearly", value: "31556926", seconds: 31_556_926 }, // 365.24 days
] as const;

/**
 * Country codes commonly used in the system
 */
const COMMON_COUNTRIES = [
  { label: "United States", value: 840 },
  { label: "Belgium", value: 56 },
  { label: "United Kingdom", value: 826 },
  { label: "Germany", value: 276 },
  { label: "France", value: 250 },
  { label: "Netherlands", value: 528 },
  { label: "Switzerland", value: 756 },
] as const;

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
    defaultValues: {
      startDate: "",
      endDate: "",
      yieldRate: "",
      paymentInterval: "",
      countryCode: "056", // Default to Belgium
    },
  });

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      form.reset();
      sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    }
  }, [open, form]);

  // Calculate estimated yield information
  const yieldEstimates = useMemo(() => {
    const { startDate, endDate, yieldRate } = form.state.values;

    if (!startDate || !endDate || !yieldRate || !asset.totalSupply) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end.getTime() - start.getTime();
    const durationDays = duration / (1000 * 60 * 60 * 24);
    const rate = Number.parseFloat(yieldRate) / 100; // Convert percentage to decimal

    // Estimate total yield (simple interest calculation)
    const totalSupplyNum = Number.parseFloat(
      format(asset.totalSupply, { digits: 6 })
    );
    const annualYield = totalSupplyNum * rate;
    const totalYield = (annualYield * durationDays) / 365;

    return {
      durationDays: Math.ceil(durationDays),
      totalYield: totalYield.toFixed(6),
      annualRate: rate * 100,
    };
  }, [form, asset.totalSupply]);

  // Handle form submission
  const handleSubmit = async (verification: {
    secretVerificationCode: string;
    verificationType?: "OTP" | "PINCODE" | "SECRET_CODES";
  }) => {
    const values = form.state.values;
    toast.loading(t("tokens:actions.setYieldSchedule.messages.preparing"));
    try {
      // Convert form values to the required format
      const startTimestamp = Math.ceil(
        new Date(values.startDate).getTime() / 1000
      );
      const endTimestamp = Math.ceil(new Date(values.endDate).getTime() / 1000);
      const yieldRateBasisPoints = (
        Number.parseFloat(values.yieldRate) * 100
      ).toString(); // Convert % to basis points

      // Step 1: Create the yield schedule
      const scheduleResult = await createYieldSchedule({
        yieldRate: yieldRateBasisPoints,
        paymentInterval: values.paymentInterval,
        startTime: startTimestamp.toString(),
        endTime: endTimestamp.toString(),
        token: asset.id,
        countryCode: Number.parseInt(values.countryCode, 10),
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
    } catch (error) {
      console.error("Failed to create yield schedule:", error);
      toast.error(t("tokens:actions.setYieldSchedule.messages.failed"));
    }
  };

  return (
    <>
      <ActionFormSheet
        open={open}
        onOpenChange={onOpenChange}
        asset={asset}
        title={t("tokens:actions.setYieldSchedule.title")}
        description={t("tokens:actions.setYieldSchedule.description")}
        submitLabel={t("tokens:actions.setYieldSchedule.submit")}
        isSubmitting={isSubmitting}
        canContinue={(args) => args.isDirty && args.errors.length === 0}
        onSubmit={handleSubmit}
        store={sheetStoreRef.current}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <form.Field name="startDate">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    {t("tokens:yield.fields.startDate")}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    onBlur={field.handleBlur}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* End Date */}
            <form.Field name="endDate">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    {t("tokens:yield.fields.endDate")}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    onBlur={field.handleBlur}
                    min={
                      form.state.values.startDate ||
                      new Date().toISOString().slice(0, 16)
                    }
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Yield Rate */}
            <form.Field name="yieldRate">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    {t("tokens:yield.fields.rate")}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type="number"
                      step="0.01"
                      min="0"
                      max="50"
                      placeholder="5.0"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                      }}
                      onBlur={field.handleBlur}
                      className="pr-8"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-muted-foreground text-sm">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("tokens:yield.fields.rateInfo")}
                  </p>
                  {field.state.meta.errors && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Payment Interval */}
            <form.Field name="paymentInterval">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    {t("tokens:yield.fields.interval")}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("tokens:yield.form.selectInterval")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_INTERVALS.map((interval) => (
                        <SelectItem key={interval.value} value={interval.value}>
                          {/* {t(
                            `tokens:yield.intervals.${interval.label.toLowerCase()}` as any
                          )} */}
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("tokens:yield.fields.intervalInfo")}
                  </p>
                  {field.state.meta.errors && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Country Code */}
          <form.Field name="countryCode">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {t("tokens:yield.fields.jurisdiction")}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("tokens:yield.form.selectCountry")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_COUNTRIES.map((country) => (
                      <SelectItem
                        key={country.value}
                        value={country.value.toString()}
                      >
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("tokens:yield.fields.jurisdictionInfo")}
                </p>
                {field.state.meta.errors && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Yield Estimates */}
          {yieldEstimates && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("tokens:yield.estimates.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("tokens:yield.estimates.duration")}
                  </span>
                  <span className="font-medium">
                    {yieldEstimates.durationDays} {t("common:days")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("tokens:yield.estimates.annualRate")}
                  </span>
                  <span className="font-medium">
                    {yieldEstimates.annualRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("tokens:yield.estimates.estimatedTotal")}
                  </span>
                  <span className="font-medium">
                    {yieldEstimates.totalYield} {asset.symbol}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("tokens:yield.estimates.disclaimer")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ActionFormSheet>
    </>
  );
}
