import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Web3Address } from "@/components/web3/web3-address";
import { useAppForm } from "@/hooks/use-app-form";
import { useSession } from "@/hooks/use-auth";
import { orpc } from "@/orpc/orpc-client";
import type { TokenBalance } from "@/orpc/routes/user/routes/user.assets.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  add,
  format,
  from,
  greaterThan,
  lessThanOrEqual,
  subtract,
  type Dnum,
} from "dnum";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

type Entry = { id: string };

interface TransferAssetSheetProps {
  open: boolean;
  onClose: () => void;
  assetBalance: TokenBalance;
}

export function TransferAssetSheet({
  open,
  onClose,
  assetBalance,
}: TransferAssetSheetProps) {
  const { t } = useTranslation(["user-assets", "common"]);
  const { data: session } = useSession();
  const qc = useQueryClient();

  const senderWallet = session?.user?.wallet;
  const newEntry = (): Entry => ({
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
  });
  const [entries, setEntries] = useState<Entry[]>([newEntry()]);

  const { mutateAsync: transfer, isPending } = useMutation(
    orpc.token.transfer.mutationOptions({
      onSuccess: async (_, variables) => {
        const recipients = Array.isArray(variables.recipients)
          ? variables.recipients
          : [variables.recipients];

        const invalidate = [
          qc.invalidateQueries({ queryKey: orpc.user.assets.queryKey() }),
          qc.invalidateQueries({
            queryKey: orpc.token.holders.queryKey({
              input: { tokenAddress: assetBalance.token.id },
            }),
          }),
        ];

        if (senderWallet) {
          invalidate.push(
            qc.invalidateQueries({
              queryKey: orpc.token.holder.queryKey({
                input: {
                  tokenAddress: assetBalance.token.id,
                  holderAddress: senderWallet,
                },
              }),
            })
          );
        }

        recipients.filter(Boolean).forEach((recipient) => {
          invalidate.push(
            qc.invalidateQueries({
              queryKey: orpc.token.holder.queryKey({
                input: {
                  tokenAddress: assetBalance.token.id,
                  holderAddress: recipient,
                },
              }),
            })
          );
        });

        await Promise.all(invalidate);
      },
    })
  );

  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));
  const form = useAppForm({ onSubmit: () => {} });

  useEffect(() => {
    if (open) {
      form.reset();
      setEntries([newEntry()]);
      sheetStoreRef.current.setState((state) => ({ ...state, step: "values" }));
    }
  }, [open, form]);

  const availableBalance = assetBalance.available;
  const tokenDecimals = assetBalance.token.decimals;
  const tokenSymbol = assetBalance.token.symbol;

  const handleClose = () => {
    form.reset();
    setEntries([newEntry()]);
    sheetStoreRef.current.setState((state) => ({ ...state, step: "values" }));
    onClose();
  };

  return (
    <form.Subscribe selector={(state) => state}>
      {() => {
        const zero = from(0n, tokenDecimals);
        const recipientValues = entries.map<EthereumAddress | "">(
          (entry) =>
            form.getFieldValue(`recipient_${entry.id}`) as EthereumAddress | ""
        );
        const rawAmountValues = entries.map(
          (entry) =>
            form.getFieldValue(`amount_${entry.id}`) as Dnum | undefined
        );
        const amountValues = rawAmountValues.map((value) => value ?? zero);
        const hasAmountInput = rawAmountValues.some(
          (value) => value !== undefined
        );

        const allRecipientsProvided = recipientValues.every(Boolean);
        const allAmountsProvided = rawAmountValues.every(
          (value) => value !== undefined
        );
        const allAmountsPositive = rawAmountValues.every(
          (value) => value !== undefined && greaterThan(value, zero)
        );
        const totalRequested = amountValues.reduce(
          (acc, value) => add(acc, value),
          zero
        );
        const withinAvailable = lessThanOrEqual(
          totalRequested,
          availableBalance
        );
        const remaining = withinAvailable
          ? subtract(availableBalance, totalRequested)
          : availableBalance;

        const canContinue = () =>
          entries.length > 0 &&
          allRecipientsProvided &&
          allAmountsProvided &&
          allAmountsPositive &&
          withinAvailable;

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("user-assets:actions.transfer.reviewTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("user-assets:actions.transfer.fromLabel")}
                  </span>
                  <span className="truncate">
                    {senderWallet ? (
                      <Web3Address
                        address={getEthereumAddress(senderWallet)}
                        size="small"
                      />
                    ) : (
                      t("common:unknown")
                    )}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {t("user-assets:actions.transfer.recipientsTitle")}
                  </div>
                  <div className="space-y-2">
                    {entries.map((entry, index) => {
                      const recipient = recipientValues[index];
                      const amount = amountValues[index];

                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between rounded-md border p-2 text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              {t("user-assets:actions.transfer.recipientLabel")}{" "}
                              #{index + 1}
                            </span>
                            {recipient ? (
                              <Web3Address
                                address={getEthereumAddress(recipient)}
                                size="small"
                              />
                            ) : (
                              <span>{t("common:unknown")}</span>
                            )}
                          </div>
                          <span className="font-medium">
                            {format(amount ?? from(0n, tokenDecimals))}{" "}
                            {tokenSymbol}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/60 p-3 text-xs">
                <div>
                  <div className="text-muted-foreground">
                    {t("user-assets:actions.transfer.availableLabel")}
                  </div>
                  <div className="font-medium">
                    {format(availableBalance)} {tokenSymbol}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">
                    {t("user-assets:actions.transfer.remainingLabel")}
                  </div>
                  <div className="font-medium">
                    {format(remaining)} {tokenSymbol}
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
            title={t("user-assets:actions.transfer.title")}
            description={t("user-assets:actions.transfer.description")}
            submitLabel={t("user-assets:actions.transfer.submit")}
            canContinue={canContinue}
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            isSubmitting={isPending}
            store={sheetStoreRef.current}
            onSubmit={(verification) => {
              const recipients = entries.map(
                (entry) =>
                  form.getFieldValue(`recipient_${entry.id}`) as EthereumAddress
              );
              const amounts = entries.map(
                (entry) =>
                  (form.getFieldValue(`amount_${entry.id}`) as
                    | Dnum
                    | undefined) ?? zero
              );

              const promise = transfer({
                contract: assetBalance.token.id,
                recipients,
                amounts,
                walletVerification: verification,
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
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t("user-assets:actions.transfer.recipientsTitle")}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => {
                        setEntries((prev) => [...prev, newEntry()]);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      {t("user-assets:actions.transfer.addRecipient")}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <div key={entry.id} className="rounded-md border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-3">
                            <AddressSelectOrInputToggle>
                              {({ mode }) => (
                                <>
                                  {mode === "select" && (
                                    <form.AppField
                                      name={`recipient_${entry.id}`}
                                    >
                                      {(field) => (
                                        <field.AddressSelectField
                                          // Restrict results to user wallets; assets stay manual-only for security.
                                          scope="user"
                                          label={t(
                                            "user-assets:actions.transfer.recipientLabel"
                                          )}
                                          description={t(
                                            "user-assets:actions.transfer.recipientDescription"
                                          )}
                                          required
                                        />
                                      )}
                                    </form.AppField>
                                  )}
                                  {mode === "manual" && (
                                    <form.AppField
                                      name={`recipient_${entry.id}`}
                                    >
                                      {(field) => (
                                        <field.AddressInputField
                                          label={t(
                                            "user-assets:actions.transfer.recipientLabel"
                                          )}
                                          description={t(
                                            "user-assets:actions.transfer.recipientDescription"
                                          )}
                                          required
                                        />
                                      )}
                                    </form.AppField>
                                  )}
                                </>
                              )}
                            </AddressSelectOrInputToggle>

                            <form.AppField name={`amount_${entry.id}`}>
                              {(field) => (
                                <field.DnumField
                                  label={t(
                                    "user-assets:actions.transfer.amountLabel"
                                  )}
                                  description={t(
                                    "user-assets:actions.transfer.amountDescription"
                                  )}
                                  endAddon={tokenSymbol}
                                  decimals={tokenDecimals}
                                  required
                                />
                              )}
                            </form.AppField>
                          </div>
                          {entries.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="mt-1 h-8 w-8 text-muted-foreground"
                              onClick={() => {
                                form.setFieldValue(
                                  `recipient_${entry.id}`,
                                  undefined as unknown as EthereumAddress
                                );
                                form.setFieldValue(
                                  `amount_${entry.id}`,
                                  undefined as unknown as Dnum
                                );
                                setEntries((prev) =>
                                  prev.filter((e) => e.id !== entry.id)
                                );
                              }}
                              aria-label={t("common:remove")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          {t("user-assets:actions.transfer.availableMessage", {
                            amount: format(availableBalance),
                            symbol: tokenSymbol,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Card className="border-dashed">
                    <CardContent className="flex flex-col gap-2 pt-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {t("user-assets:actions.transfer.totalLabel")}
                        </span>
                        <span className="font-medium">
                          {format(totalRequested)} {tokenSymbol}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {t("user-assets:actions.transfer.availableLabel")}
                        </span>
                        <span>
                          {format(availableBalance)} {tokenSymbol}
                        </span>
                      </div>
                      {hasAmountInput &&
                        allAmountsProvided &&
                        (!allAmountsPositive || !withinAvailable) && (
                          <div className="text-xs text-destructive">
                            {allAmountsPositive
                              ? t("user-assets:actions.transfer.overAvailable")
                              : t(
                                  "user-assets:actions.transfer.amountRequired"
                                )}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
