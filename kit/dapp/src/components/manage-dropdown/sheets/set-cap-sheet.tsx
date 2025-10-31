import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dnum, format, from, greaterThan } from "dnum";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

interface SetCapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
}

export function SetCapSheet({ open, onOpenChange, asset }: SetCapSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();

  const { mutateAsync: setCap, isPending } = useMutation(
    orpc.token.setCap.mutationOptions({
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

  const currentCap = asset.capped?.cap ?? from(0n, asset.decimals);
  const totalSupply = asset.totalSupply;

  const handleClose = () => {
    form.reset();
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        const newCap =
          (form.getFieldValue("newCap") as Dnum | undefined) ??
          from(0n, asset.decimals);

        const canContinue = () => greaterThan(newCap, totalSupply);

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("tokens:actions.setCap.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:fields.cap")}
                  </div>
                  <div className="text-sm font-medium">
                    {format(currentCap)} {asset.symbol}
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:actions.setCap.submit")}
                  </div>
                  <div className="text-sm font-medium">
                    {format(newCap)} {asset.symbol}
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
            title={t("tokens:actions.setCap.title")}
            description={t("tokens:actions.setCap.description")}
            submitLabel={t("tokens:actions.setCap.submit")}
            canContinue={canContinue}
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            isSubmitting={isPending}
            store={sheetStoreRef.current}
            onSubmit={(verification) => {
              const promise = setCap({
                contract: asset.id,
                walletVerification: verification,
                newCap,
              });

              toast
                .promise(promise, {
                  loading: t("common:saving"),
                  success: t("common:saved"),
                  error: (data) => t("common:error", { message: data.message }),
                })
                .unwrap()
                .then(() => {
                  handleClose();
                })
                .catch(() => undefined);
            }}
          >
            <Card>
              <CardContent>
                <div className="space-y-4">
                  <form.AppField name="newCap">
                    {(field) => (
                      <field.DnumField
                        label={t("tokens:actions.setCap.title")}
                        endAddon={asset.symbol}
                        decimals={asset.decimals}
                        required
                      />
                    )}
                  </form.AppField>
                  <div className="text-xs text-muted-foreground">
                    {t("tokens:actions.mint.form.limit")}
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

export default SetCapSheet;
