import { invalidateTokenActionQueries } from "@/components/manage-dropdown/core/invalidate-token-action-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { TokenBalance } from "@/orpc/routes/user/routes/user.assets.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, from, greaterThan, lessThanOrEqual, type Dnum } from "dnum";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";
import type { EthereumAddress } from "@atk/zod/ethereum-address";

interface RedeemSheetProps {
  open: boolean;
  onClose: () => void;
  assetBalance: TokenBalance;
  holderAddress: EthereumAddress | null;
}

export function RedeemSheet({
  open,
  onClose,
  assetBalance,
  holderAddress,
}: RedeemSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();

  const { mutateAsync: redeem, isPending } = useMutation(
    orpc.token.redeem.mutationOptions({
      onSuccess: async () => {
        await invalidateTokenActionQueries(qc, {
          tokenAddress: assetBalance.token.id,
          includeUserAssets: true,
          holderAddresses: holderAddress ? [holderAddress] : [],
        });
      },
    })
  );

  const tokenDecimals = assetBalance.token.decimals;
  const tokenSymbol = assetBalance.token.symbol;
  const maxAmountToRedeem = from(assetBalance.available, tokenDecimals);

  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));
  const form = useAppForm({
    defaultValues: { amount: maxAmountToRedeem },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (open) {
      form.reset();
      sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    }
  }, [open, form]);

  const handleClose = () => {
    form.reset();
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onClose();
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        const amount =
          (form.getFieldValue("amount") as Dnum | undefined) ??
          from(0n, tokenDecimals);

        const redeemAmount = amount;

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("tokens:actions.redeem.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:actions.redeem.form.balance.available")}
                  </div>
                  <div className="text-sm font-medium">
                    {format(maxAmountToRedeem)} {tokenSymbol}
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:actions.redeem.submit")}
                  </div>
                  <div className="text-sm font-medium">
                    {format(redeemAmount)} {tokenSymbol}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={handleClose}
            asset={assetBalance.token}
            title={t("tokens:actions.redeem.title")}
            description={t("tokens:actions.redeem.description")}
            submitLabel={t("tokens:actions.redeem.submit")}
            canContinue={() =>
              greaterThan(amount, 0n) &&
              lessThanOrEqual(amount, maxAmountToRedeem)
            }
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            isSubmitting={isPending}
            store={sheetStoreRef.current}
            onSubmit={(verification) => {
              const promise = redeem({
                contract: assetBalance.token.id,
                walletVerification: verification,
                amount,
              });

              toast
                .promise(promise, {
                  loading: t("tokens:actions.redeem.toasts.loading"),
                  success: t("tokens:actions.redeem.toasts.success", {
                    amount: format(redeemAmount),
                    symbol: tokenSymbol,
                  }),
                  error: (error) =>
                    t("tokens:actions.redeem.toasts.error", {
                      error: error.message,
                    }),
                })
                .unwrap()
                .then(() => {
                  handleClose();
                })
                .catch(() => undefined);
            }}
          >
            <Card>
              <CardContent className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      {t("tokens:actions.redeem.form.balance.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("tokens:actions.redeem.form.balance.available")}
                      </span>
                      <span className="font-medium">
                        {format(maxAmountToRedeem)} {tokenSymbol}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <form.AppField name="amount">
                      {(field) => (
                        <field.DnumField
                          label={t("tokens:actions.redeem.form.amount.label")}
                          endAddon={tokenSymbol}
                          decimals={tokenDecimals}
                          required
                        />
                      )}
                    </form.AppField>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
