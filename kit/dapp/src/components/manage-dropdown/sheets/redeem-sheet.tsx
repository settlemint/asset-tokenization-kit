import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, from, greaterThan, lessThanOrEqual, type Dnum } from "dnum";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

interface RedeemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
}

export function RedeemSheet({ open, onOpenChange, asset }: RedeemSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();

  const { mutateAsync: redeem, isPending } = useMutation(
    orpc.token.redeem.mutationOptions({
      onSuccess: async () => {
        await qc.invalidateQueries({
          queryKey: orpc.token.read.queryOptions({
            input: { tokenAddress: asset.id },
          }).queryKey,
        });
      },
    })
  );

  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));
  const form = useAppForm({ onSubmit: () => {} });

  useEffect(() => {
    if (open) {
      form.reset();
      sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    }
  }, [open, form]);

  const userBalance: Dnum = useMemo(() => {
    // For now, use zero as default - the backend will handle validation
    // TODO: Add proper balance fetching from a separate query
    return [0n, asset.decimals];
  }, [asset.decimals]);

  const handleClose = () => {
    form.reset();
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        const amount =
          (form.getFieldValue("amount") as Dnum | undefined) ??
          from(0n, asset.decimals);
        const redeemAll =
          (form.getFieldValue("redeemAll") as boolean | undefined) ?? false;

        const redeemAmount = redeemAll ? userBalance : amount;

        const canContinue = () => {
          if (redeemAll) return greaterThan(userBalance, [0n, asset.decimals]);
          return (
            greaterThan(amount, [0n, asset.decimals]) &&
            lessThanOrEqual(amount, userBalance)
          );
        };

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
                    {format(userBalance, { digits: 4 })} {asset.symbol}
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:actions.redeem.submit")}
                  </div>
                  <div className="text-sm font-medium">
                    {format(redeemAmount, { digits: 4 })} {asset.symbol}
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
            asset={asset}
            title={t("tokens:actions.redeem.title")}
            description={t("tokens:actions.redeem.description")}
            submitLabel={t("tokens:actions.redeem.submit")}
            canContinue={canContinue}
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            isSubmitting={isPending}
            store={sheetStoreRef.current}
            onSubmit={(verification) => {
              const promise = redeem({
                contract: asset.id,
                walletVerification: verification,
                amount: redeemAll ? undefined : redeemAmount[0].toString(),
                redeemAll,
              });

              toast.promise(promise, {
                loading: t("tokens:actions.redeem.toasts.loading"),
                success: t("tokens:actions.redeem.toasts.success", {
                  amount: format(redeemAmount, { digits: 4 }),
                  symbol: asset.symbol,
                }),
                error: (error) =>
                  t("tokens:actions.redeem.toasts.error", {
                    error: error.message,
                  }),
              });

              handleClose();
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
                        {format(userBalance, { digits: 4 })} {asset.symbol}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <form.AppField name="redeemAll">
                    {(field) => (
                      <field.CheckboxField
                        label={t("tokens:actions.redeem.form.redeemAll")}
                      />
                    )}
                  </form.AppField>

                  {!redeemAll && (
                    <div className="space-y-2">
                      <form.AppField name="amount">
                        {(field) => (
                          <div className="space-y-2">
                            <field.DnumField
                              label={t(
                                "tokens:actions.redeem.form.amount.label"
                              )}
                              endAddon={asset.symbol}
                              decimals={asset.decimals}
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                field.handleChange(userBalance);
                              }}
                            >
                              {t("tokens:actions.redeem.form.amount.max")}
                            </Button>
                          </div>
                        )}
                      </form.AppField>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
