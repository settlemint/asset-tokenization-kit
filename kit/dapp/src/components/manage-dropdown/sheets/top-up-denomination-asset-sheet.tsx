import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { useSession } from "@/hooks/use-auth";
import { orpc } from "@/orpc/orpc-client";
import { FixedYieldScheduleTopUpInput } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.top-up.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { FixedYieldSchedule } from "@atk/zod/fixed-yield-schedule";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { add, format, from, greaterThan, lessThanOrEqual } from "dnum";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";
/**
 * Props for the TopUpDenominationAssetSheet component.
 */
interface TopUpDenominationAssetSheetProps {
  /** Controls sheet visibility */
  open: boolean;
  /** Callback when sheet open state changes */
  onOpenChange: (open: boolean) => void;
  /** Token to create yield schedule for */
  asset: Token;
  denominationAsset: Token;
  yieldSchedule: FixedYieldSchedule;
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
export function TopUpDenominationAssetSheet({
  open,
  onOpenChange,
  asset,
  denominationAsset,
  yieldSchedule,
}: TopUpDenominationAssetSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();
  const { data: session } = useSession();
  const userWallet = session?.user?.wallet;

  // Fetch user's balance of the denomination asset
  const { data: userDenominationAssetBalance } = useQuery({
    ...orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAsset.id,
        holderAddress: userWallet ?? "",
      },
    }),
    enabled: !!userWallet,
  });

  // Fetch yield schedule's denomination asset balance
  const { data: yieldScheduleBalance } = useQuery({
    ...orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAsset.id,
        holderAddress: yieldSchedule.id,
      },
    }),
    enabled: !!userWallet,
  });

  const { mutateAsync: topUp, isPending } = useMutation(
    orpc.fixedYieldSchedule.topUp.mutationOptions({
      onSuccess: async () => {
        await qc.invalidateQueries({
          queryKey: orpc.token.read.queryKey({
            input: { tokenAddress: denominationAsset.id },
          }),
        });

        // Refresh user's denomination asset balance
        await qc.invalidateQueries({
          queryKey: orpc.token.holder.queryKey({
            input: {
              tokenAddress: denominationAsset.id,
              holderAddress: userWallet ?? "",
            },
          }),
        });

        // Refresh yield schedule's balance
        await qc.invalidateQueries({
          queryKey: orpc.token.holder.queryKey({
            input: {
              tokenAddress: denominationAsset.id,
              holderAddress: yieldSchedule.id,
            },
          }),
        });

        toast.success(t("tokens:actions.topUpDenominationAsset.success"));
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(
          t("tokens:actions.topUpDenominationAsset.error", {
            error: error.message,
          })
        );
      },
    })
  );

  // Store for stepper state
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  // Form initialization
  const form = useAppForm({
    defaultValues: {} as FixedYieldScheduleTopUpInput,
  });

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      form.reset();
      sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    }
  }, [open, form]);

  // Form validation and calculation helpers
  const userBalance =
    userDenominationAssetBalance?.holder?.available ??
    from(0n, denominationAsset.decimals);
  const currentYieldScheduleBalance =
    yieldScheduleBalance?.holder?.available ??
    from(0n, denominationAsset.decimals);

  // Handle form submission
  const handleSubmit = async (verification: {
    secretVerificationCode: string;
    verificationType?: "OTP" | "PINCODE" | "SECRET_CODES";
  }) => {
    try {
      const amount = form.getFieldValue("amount");
      await topUp({
        amount: amount,
        contract: yieldSchedule.id,
        walletVerification: verification,
      });
    } catch {
      // Error is handled by mutation onError
    }
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        const amountFieldValue = form.getFieldValue("amount");
        const amount = amountFieldValue
          ? from(amountFieldValue, denominationAsset.decimals)
          : from(0n, denominationAsset.decimals);

        // Validation logic
        const hasValidAmount = greaterThan(
          amount,
          from(0n, denominationAsset.decimals)
        );
        const withinBalance = lessThanOrEqual(amount, userBalance);
        const canContinue = () => hasValidAmount && withinBalance;

        // Calculate new balance after top-up
        const newYieldScheduleBalance = add(
          currentYieldScheduleBalance,
          amount,
          denominationAsset.decimals
        );

        // Summary step content
        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t(
                  "tokens:actions.topUpDenominationAsset.reviewTitle",
                  "Review Top Up"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t(
                      "tokens:actions.topUpDenominationAsset.currentBalance",
                      "Current Balance"
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {format(currentYieldScheduleBalance)}{" "}
                    {denominationAsset.symbol}
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t(
                      "tokens:actions.topUpDenominationAsset.newBalance",
                      "New Balance"
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {format(newYieldScheduleBalance)} {denominationAsset.symbol}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("tokens:actions.topUpDenominationAsset.amountLabel")}
                  </span>
                  <span className="font-medium">
                    {format(amount)} {denominationAsset.symbol}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={onOpenChange}
            asset={asset}
            title={t("tokens:actions.topUpDenominationAsset.title")}
            description={t(
              "tokens:actions.topUpDenominationAsset.description",
              {
                symbol: denominationAsset.symbol,
              }
            )}
            submitLabel={t("tokens:actions.topUpDenominationAsset.submit")}
            isSubmitting={isPending}
            hasValuesStep={true}
            canContinue={canContinue}
            onSubmit={handleSubmit}
            store={sheetStoreRef.current}
            showAssetDetailsOnConfirm={false}
            confirm={confirmView}
          >
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <form.AppField name="amount">
                    {(field) => (
                      <field.DnumField
                        label={t(
                          "tokens:actions.topUpDenominationAsset.amountLabel"
                        )}
                        endAddon={denominationAsset.symbol}
                        decimals={denominationAsset.decimals}
                        required
                      />
                    )}
                  </form.AppField>

                  <div className="mt-3 text-xs text-muted-foreground">
                    {t("tokens:actions.topUpDenominationAsset.available")}:{" "}
                    {format(userBalance)} {denominationAsset.symbol}
                  </div>

                  {hasValidAmount && !withinBalance && (
                    <div className="mt-2 text-xs text-destructive">
                      {t(
                        "tokens:actions.topUpDenominationAsset.insufficientBalance"
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
