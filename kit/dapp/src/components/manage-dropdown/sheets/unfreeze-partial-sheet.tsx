import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Web3Address } from "@/components/web3/web3-address";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, from, greaterThan, type Dnum } from "dnum";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

interface UnfreezePartialSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
}

export function UnfreezePartialSheet({
  open,
  onOpenChange,
  asset,
}: UnfreezePartialSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();

  const { mutateAsync: unfreezePartial, isPending } = useMutation(
    orpc.token.unfreezePartial.mutationOptions({
      onSuccess: async () => {
        const invalidationPromises = [
          qc.invalidateQueries({
            queryKey: orpc.token.read.queryKey({
              input: { tokenAddress: asset.id },
            }),
          }),
          qc.invalidateQueries({
            queryKey: orpc.token.holders.queryKey({
              input: { tokenAddress: asset.id },
            }),
          }),
        ];

        await Promise.all(invalidationPromises);
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

  const tokenDecimals = asset.decimals;

  const handleClose = () => {
    form.reset();
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        const userAddress = form.getFieldValue("userAddress") as
          | EthereumAddress
          | "";
        const amount = form.getFieldValue("amount") as Dnum | undefined;

        const hasValidInputs =
          Boolean(userAddress) &&
          greaterThan(
            amount ?? from(0n, tokenDecimals),
            from(0n, tokenDecimals)
          );

        const canContinue = () => hasValidInputs;

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("tokens:actions.unfreezePartial.reviewTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("tokens:actions.unfreezePartial.form.addressLabel")}
                    </span>
                    <span className="truncate ml-2">
                      {userAddress ? (
                        <Web3Address
                          address={getEthereumAddress(userAddress)}
                          copyToClipboard
                          size="small"
                        />
                      ) : (
                        t("common:unknown")
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">
                      {t("tokens:actions.unfreezePartial.form.amountLabel")}
                    </span>
                    <span className="font-medium">
                      {format(amount ?? from(0n, tokenDecimals))} {asset.symbol}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground rounded-md bg-muted/50 p-3">
                  {t("tokens:actions.unfreezePartial.confirmationNote")}
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
            title={t("tokens:actions.unfreezePartial.title")}
            description={t("tokens:actions.unfreezePartial.description")}
            submitLabel={t("tokens:actions.unfreezePartial.submit")}
            canContinue={canContinue}
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            isSubmitting={isPending}
            store={sheetStoreRef.current}
            onSubmit={(verification) => {
              const userAddress = form.getFieldValue(
                "userAddress"
              ) as EthereumAddress;
              const amount = form.getFieldValue("amount") as Dnum;

              const promise = unfreezePartial({
                contract: asset.id,
                userAddress,
                amount: format(amount, { digits: 18 }),
                walletVerification: verification,
              });

              toast.promise(promise, {
                loading: t("common:saving"),
                success: t("common:saved"),
                error: (data) => t("common:error", { message: data.message }),
              });

              handleClose();
            }}
          >
            <div className="space-y-4">
              <div>
                <AddressSelectOrInputToggle>
                  {({ mode }) => (
                    <>
                      {mode === "select" && (
                        <form.AppField name="userAddress">
                          {(field) => (
                            <field.AddressSelectField
                              scope="user"
                              label={t(
                                "tokens:actions.unfreezePartial.form.addressLabel"
                              )}
                              description={t(
                                "tokens:actions.unfreezePartial.form.addressDescription"
                              )}
                              required
                            />
                          )}
                        </form.AppField>
                      )}
                      {mode === "manual" && (
                        <form.AppField name="userAddress">
                          {(field) => (
                            <field.AddressInputField
                              label={t(
                                "tokens:actions.unfreezePartial.form.addressLabel"
                              )}
                              description={t(
                                "tokens:actions.unfreezePartial.form.addressDescription"
                              )}
                              required
                            />
                          )}
                        </form.AppField>
                      )}
                    </>
                  )}
                </AddressSelectOrInputToggle>
              </div>
              <div>
                <form.AppField name="amount">
                  {(field) => (
                    <field.DnumField
                      label={t(
                        "tokens:actions.unfreezePartial.form.amountLabel"
                      )}
                      description={t(
                        "tokens:actions.unfreezePartial.form.amountDescription"
                      )}
                      endAddon={asset.symbol}
                      decimals={asset.decimals}
                      required
                    />
                  )}
                </form.AppField>
              </div>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
