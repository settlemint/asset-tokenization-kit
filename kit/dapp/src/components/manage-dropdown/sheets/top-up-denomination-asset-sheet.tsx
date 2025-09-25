import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { useSession } from "@/hooks/use-auth";
import { orpc } from "@/orpc/orpc-client";
import { FixedYieldScheduleTopUpInput } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.top-up.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
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
  /** Token with yield schedule to top up denomination asset for */
  asset: Token;
}

/**
 * Top-up denomination asset interface for yield schedule contracts.
 *
 * @remarks
 * BUSINESS LOGIC: Implements denomination asset top-up workflow that allows
 * users to add funds to a yield schedule's denomination asset balance.
 * This increases the available funds for yield payments.
 *
 * VALIDATION: Ensures user has sufficient balance of the denomination asset
 * and amount is valid before allowing the top-up operation.
 *
 * SECURITY: Requires wallet verification for the top-up transaction to prevent
 * unauthorized transfers of denomination assets to the yield schedule.
 */
export function TopUpDenominationAssetSheet({
  open,
  onOpenChange,
  asset,
}: TopUpDenominationAssetSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();
  const { data: session } = useSession();
  const yieldScheduleId = asset.yield?.schedule?.id;
  const userWallet = session?.user?.wallet;

  const { data: yieldSchedule } = useQuery(
    orpc.fixedYieldSchedule.read.queryOptions({
      input: { id: yieldScheduleId ?? "" },
      enabled: !!yieldScheduleId,
    })
  );

  // Fetch denomination asset details when available
  const denominationAssetId = yieldSchedule?.denominationAsset?.id;
  const { data: denominationAsset } = useQuery(
    orpc.token.read.queryOptions({
      input: { tokenAddress: denominationAssetId ?? "" },
      enabled: !!denominationAssetId,
    })
  );

  // Fetch user's balance of the denomination asset
  const { data: userDenominationAssetBalance } = useQuery(
    orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAsset?.id ?? "",
        holderAddress: userWallet ?? "",
      },
      enabled: !!userWallet && !!denominationAsset,
    })
  );

  // Fetch yield schedule's denomination asset balance
  const { data: yieldScheduleBalance } = useQuery(
    orpc.token.holder.queryOptions({
      input: {
        tokenAddress: denominationAsset?.id ?? "",
        holderAddress: yieldSchedule?.id ?? "",
      },
      enabled: !!denominationAsset && !!yieldSchedule,
    })
  );

  const { mutateAsync: topUp, isPending } = useMutation(
    orpc.fixedYieldSchedule.topUp.mutationOptions({
      onSuccess: async () => {
        // PERFORMANCE: Run all query invalidations in parallel
        const invalidationPromises = [
          // Refresh denomination asset data
          qc.invalidateQueries({
            queryKey: orpc.token.read.queryKey({
              input: { tokenAddress: denominationAsset?.id ?? "" },
            }),
          }),
          // Refresh user's denomination asset balance
          qc.invalidateQueries({
            queryKey: orpc.token.holder.queryKey({
              input: {
                tokenAddress: denominationAsset?.id ?? "",
                holderAddress: userWallet ?? "",
              },
            }),
          }),
          // Refresh yield schedule's balance
          qc.invalidateQueries({
            queryKey: orpc.token.holder.queryKey({
              input: {
                tokenAddress: denominationAsset?.id ?? "",
                holderAddress: yieldSchedule?.id ?? "",
              },
            }),
          }),
        ];

        await Promise.all(invalidationPromises);
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
  const denominationAssetDecimals = denominationAsset?.decimals ?? 0;
  const denominationAssetSymbol = denominationAsset?.symbol ?? "";

  const userBalance =
    userDenominationAssetBalance?.holder?.available ??
    from(0n, denominationAssetDecimals);
  const currentYieldScheduleBalance =
    yieldScheduleBalance?.holder?.available ??
    from(0n, denominationAssetDecimals);

  // CLEANUP: Reset all form state when sheet closes
  const handleClose = () => {
    form.reset();
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        const amountFieldValue = form.getFieldValue("amount");
        const amount = amountFieldValue
          ? from(amountFieldValue, denominationAssetDecimals)
          : from(0n, denominationAssetDecimals);

        // Validation logic
        const hasValidAmount = greaterThan(
          amount,
          from(0n, denominationAssetDecimals)
        );
        const withinBalance = lessThanOrEqual(amount, userBalance);
        const hasZeroBalance = userBalance[0] === 0n;
        const canContinue = () => hasValidAmount && withinBalance;

        // Calculate new balance after top-up
        const newYieldScheduleBalance = add(
          currentYieldScheduleBalance,
          amount,
          denominationAssetDecimals
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
                    {denominationAssetSymbol}
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
                    {format(newYieldScheduleBalance)} {denominationAssetSymbol}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("tokens:actions.topUpDenominationAsset.amountLabel")}
                  </span>
                  <span className="font-medium">
                    {format(amount)} {denominationAssetSymbol}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={handleClose}
            asset={asset}
            title={t("tokens:actions.topUpDenominationAsset.title")}
            description={t(
              "tokens:actions.topUpDenominationAsset.description",
              {
                symbol: denominationAssetSymbol,
              }
            )}
            submitLabel={t("tokens:actions.topUpDenominationAsset.submit")}
            isSubmitting={isPending}
            hasValuesStep={true}
            canContinue={canContinue}
            onSubmit={(verification) => {
              const amount = form.getFieldValue("amount");
              const promise = topUp({
                amount: amount,
                contract: yieldSchedule?.id ?? "",
                walletVerification: verification,
              });

              toast.promise(promise, {
                loading: t("common:saving"),
                success: t("common:saved"),
                error: (data) => t("common:error", { message: data.message }),
              });

              handleClose();
            }}
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
                        endAddon={denominationAssetSymbol}
                        decimals={denominationAssetDecimals}
                        required
                      />
                    )}
                  </form.AppField>

                  <div className="mt-3 text-xs text-muted-foreground">
                    {t("tokens:actions.topUpDenominationAsset.available")}:{" "}
                    {format(userBalance)} {denominationAssetSymbol}
                  </div>

                  {(hasZeroBalance || (hasValidAmount && !withinBalance)) && (
                    <div className="mt-2 text-xs text-destructive">
                      {hasZeroBalance
                        ? t("tokens:actions.topUpDenominationAsset.noBalance", {
                            symbol: denominationAssetSymbol,
                          })
                        : t(
                            "tokens:actions.topUpDenominationAsset.insufficientBalance",
                            { symbol: denominationAssetSymbol }
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
