import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { invalidateTokenActionQueries } from "@/components/manage-dropdown/core/invalidate-token-action-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Web3Address } from "@/components/web3/web3-address";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import { FixedYieldScheduleWithdrawInput } from "@/orpc/routes/fixed-yield-schedule/routes/fixed-yield-schedule.withdraw.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, from, greaterThan, lessThanOrEqual, subtract } from "dnum";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

/**
 * Props for the WithdrawDenominationAssetSheet component.
 */
interface WithdrawDenominationAssetSheetProps {
  /** Controls sheet visibility */
  open: boolean;
  /** Callback when sheet open state changes */
  onOpenChange: (open: boolean) => void;
  /** Token with yield schedule to withdraw denomination asset from */
  asset: Token;
}

/**
 * Withdraw denomination asset interface for yield schedule contracts.
 *
 * @remarks
 * BUSINESS LOGIC: Implements denomination asset withdrawal workflow that allows
 * users to withdraw funds from a yield schedule's denomination asset balance.
 * This reduces the available funds for yield payments.
 *
 * VALIDATION: Ensures the yield schedule has sufficient denomination asset balance
 * and amount is valid before allowing the withdrawal operation.
 *
 * SECURITY: Requires wallet verification for the withdrawal transaction to prevent
 * unauthorized transfers of denomination assets from the yield schedule.
 */
export function WithdrawDenominationAssetSheet({
  open,
  onOpenChange,
  asset,
}: WithdrawDenominationAssetSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();
  const yieldScheduleId = asset.yield?.schedule?.id;

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

  const { mutateAsync: withdraw, isPending } = useMutation(
    orpc.fixedYieldSchedule.withdraw.mutationOptions({
      onSuccess: async (_, variables) => {
        await invalidateTokenActionQueries(qc, {
          tokenAddress: asset.id,
        });
        if (denominationAsset?.id) {
          await invalidateTokenActionQueries(qc, {
            tokenAddress: denominationAsset.id,
            holderAddresses: [
              yieldSchedule?.id,
              variables.to as EthereumAddress,
            ].filter((a) => a !== undefined),
          });
        }
      },
    })
  );

  // Store for stepper state
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  // Form initialization
  const form = useAppForm({
    defaultValues: {} as FixedYieldScheduleWithdrawInput,
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
        const toFieldValue = form.getFieldValue("to");
        const amount = amountFieldValue
          ? from(amountFieldValue, denominationAssetDecimals)
          : from(0n, denominationAssetDecimals);

        // Validation logic
        const hasValidAmount = greaterThan(
          amount,
          from(0n, denominationAssetDecimals)
        );
        const withinAvailableBalance = lessThanOrEqual(
          amount,
          currentYieldScheduleBalance
        );
        const hasValidRecipient = !!toFieldValue;
        const hasZeroBalance = currentYieldScheduleBalance[0] === 0n;
        const canContinue = () =>
          hasValidAmount && withinAvailableBalance && hasValidRecipient;

        // Calculate new balance after withdrawal
        const newYieldScheduleBalance = subtract(
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
                  "tokens:actions.withdrawDenominationAsset.reviewTitle",
                  "Review Withdrawal"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t(
                      "tokens:actions.withdrawDenominationAsset.currentBalance",
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
                      "tokens:actions.withdrawDenominationAsset.newBalance",
                      "New Balance"
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {format(newYieldScheduleBalance)} {denominationAssetSymbol}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("tokens:actions.withdrawDenominationAsset.amountLabel")}
                  </span>
                  <span className="font-medium">
                    {format(amount)} {denominationAssetSymbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t(
                      "tokens:actions.withdrawDenominationAsset.recipientLabel"
                    )}
                  </span>
                  <Web3Address address={toFieldValue} />
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
            title={t("tokens:actions.withdrawDenominationAsset.title")}
            description={t(
              "tokens:actions.withdrawDenominationAsset.description",
              {
                symbol: denominationAssetSymbol,
              }
            )}
            submitLabel={t("tokens:actions.withdrawDenominationAsset.submit")}
            isSubmitting={isPending}
            hasValuesStep={true}
            canContinue={canContinue}
            onSubmit={(verification) => {
              const amount = form.getFieldValue("amount");
              const to = form.getFieldValue("to");
              const promise = withdraw({
                contract: asset.id, // Use asset ID as in the test
                yieldSchedule: yieldSchedule?.id ?? "",
                amount: amount,
                to: to,
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
                <CardContent className="pt-6 space-y-4">
                  <AddressSelectOrInputToggle>
                    {({ mode }) => (
                      <>
                        {mode === "select" && (
                          <form.AppField
                            name="to"
                            children={(field) => (
                              <field.AddressSelectField
                                scope="user"
                                label={t(
                                  "tokens:actions.withdrawDenominationAsset.recipientLabel"
                                )}
                                required
                              />
                            )}
                          />
                        )}
                        {mode === "manual" && (
                          <form.AppField
                            name="to"
                            children={(field) => (
                              <field.AddressInputField
                                label={t(
                                  "tokens:actions.withdrawDenominationAsset.recipientLabel"
                                )}
                                required
                              />
                            )}
                          />
                        )}
                      </>
                    )}
                  </AddressSelectOrInputToggle>

                  <form.AppField name="amount">
                    {(field) => (
                      <field.DnumField
                        label={t(
                          "tokens:actions.withdrawDenominationAsset.amountLabel"
                        )}
                        endAddon={denominationAssetSymbol}
                        decimals={denominationAssetDecimals}
                        required
                      />
                    )}
                  </form.AppField>

                  <div className="mt-3 text-xs text-muted-foreground">
                    {t("tokens:actions.withdrawDenominationAsset.available")}:{" "}
                    {format(currentYieldScheduleBalance)}{" "}
                    {denominationAssetSymbol}
                  </div>

                  {(hasZeroBalance ||
                    (hasValidAmount && !withinAvailableBalance)) && (
                    <div className="mt-2 text-xs text-destructive">
                      {hasZeroBalance
                        ? t(
                            "tokens:actions.withdrawDenominationAsset.noBalance",
                            {
                              symbol: denominationAssetSymbol,
                            }
                          )
                        : t(
                            "tokens:actions.withdrawDenominationAsset.insufficientBalance",
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
