import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { ActionFormSheet } from "../core/action-form-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { createActionFormStore } from "../core/action-form-sheet.store";
import { toast } from "sonner";
import { orpc } from "@/orpc/orpc-client";
import type { Dnum } from "dnum";
import { format, from, lessThanOrEqual, subtract } from "dnum";
import { Web3Address } from "@/components/web3/web3-address";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";

type Entry = { address: EthereumAddress | ""; amount?: bigint; max?: Dnum };

interface BurnSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
  preset?: { address: EthereumAddress; available?: Dnum } | undefined;
}

export function BurnSheet({
  open,
  onOpenChange,
  asset,
  preset,
}: BurnSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();

  const { mutateAsync: burn, isPending } = useMutation(
    orpc.token.burn.mutationOptions({
      onSuccess: async () => {
        await qc.invalidateQueries({
          queryKey: orpc.token.read.queryOptions({
            input: { tokenAddress: asset.id },
          }).queryKey,
        });
      },
    })
  );

  const [entries, setEntries] = useState<Entry[]>([
    {
      address: (preset?.address as EthereumAddress) ?? ("" as EthereumAddress),
      amount: undefined,
      max: preset?.available,
    },
  ]);
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  const form = useAppForm({ onSubmit: () => {} });

  // Reset state when sheet opens or preset changes
  useEffect(() => {
    if (open) {
      setEntries([
        {
          address:
            (preset?.address as EthereumAddress) ?? ("" as EthereumAddress),
          amount: undefined,
          max: preset?.available,
        },
      ]);
      form.reset();
      sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    }
  }, [open, preset, form]);

  const tokenDecimals = asset.decimals;

  const presetHasBalance = useMemo(() => {
    if (!preset?.available) return true; // if unknown, don't block
    return preset.available[0] > 0n;
  }, [preset]);

  const handleClose = () => {
    form.reset();
    setEntries([
      {
        address:
          (preset?.address as EthereumAddress) ?? ("" as EthereumAddress),
        amount: undefined,
        max: preset?.available,
      },
    ]);
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        const hasValidRows =
          entries.length > 0 &&
          entries.every((_, i) => {
            const addr = form.getFieldValue(`burn_address_${i}`) as
              | EthereumAddress
              | "";
            const amt = form.getFieldValue(`burn_amount_${i}`) as
              | bigint
              | undefined;
            const limit = entries[i]?.max;
            const validAmount = (amt ?? 0n) > 0n;
            const withinMax = limit
              ? lessThanOrEqual(from(amt ?? 0n, tokenDecimals), limit)
              : true;
            return Boolean(addr) && validAmount && withinMax;
          });
        const canContinue = () => hasValidRows && presetHasBalance;

        const totalBurn = from(
          entries
            .map(
              (_, i) =>
                (form.getFieldValue(`burn_amount_${i}`) as
                  | bigint
                  | undefined) ?? 0n
            )
            .reduce((acc, a) => acc + a, 0n),
          tokenDecimals
        );
        const newTotalSupply = subtract(asset.totalSupply, totalBurn);

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("tokens:actions.burn.reviewTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:details.currentSupply")}
                  </div>
                  <div className="text-sm font-medium">
                    {format(asset.totalSupply)} {asset.symbol}
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:details.newSupply")}
                  </div>
                  <div className="text-sm font-medium">
                    {format(newTotalSupply)} {asset.symbol}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  {t("tokens:actions.burn.addresses")}
                </div>
                <div className="rounded-md border divide-y">
                  {entries.map((_, i) => {
                    const addr = form.getFieldValue(
                      `burn_address_${i}`
                    ) as EthereumAddress | null;
                    const amt =
                      (form.getFieldValue(`burn_amount_${i}`) as
                        | bigint
                        | undefined) ?? 0n;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2 text-sm"
                      >
                        <span className="truncate mr-2">
                          {addr ? (
                            <Web3Address
                              address={getEthereumAddress(addr)}
                              copyToClipboard
                              size="small"
                              showFullAddress={false}
                            />
                          ) : (
                            t("common:unknown")
                          )}
                        </span>
                        <span className="font-medium">
                          {amt.toString()} {asset.symbol}
                        </span>
                      </div>
                    );
                  })}
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
            title={t("tokens:actions.burn.title")}
            description={t("tokens:actions.burn.description")}
            submitLabel={t("tokens:actions.burn.submit")}
            canContinue={canContinue}
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            isSubmitting={isPending}
            onSubmit={(verification) => {
              const addresses = entries.map(
                (_, i) =>
                  form.getFieldValue(`burn_address_${i}`) as EthereumAddress
              );
              const amounts = entries.map(
                (_, i) =>
                  (form.getFieldValue(`burn_amount_${i}`) as
                    | bigint
                    | undefined) ?? 0n
              );

              const promise = burn({
                contract: asset.id,
                addresses,
                amounts,
                verification,
              });

              toast.promise(promise, {
                loading: t("common:saving"),
                success: t("common:saved"),
                error: t("common:error"),
              });

              handleClose();
            }}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                {entries.map((entry, idx) => (
                  <Card key={idx}>
                    <CardContent>
                      <div className="relative space-y-2">
                        <div>
                          <AddressSelectOrInputToggle>
                            {({ mode }) => (
                              <>
                                {mode === "select" && (
                                  <form.AppField name={`burn_address_${idx}`}>
                                    {(field) => (
                                      <field.AddressSelectField
                                        scope="user"
                                        label={t(
                                          "tokens:actions.burn.form.addressLabel"
                                        )}
                                        required
                                      />
                                    )}
                                  </form.AppField>
                                )}
                                {mode === "manual" && (
                                  <form.AppField name={`burn_address_${idx}`}>
                                    {(field) => (
                                      <field.AddressInputField
                                        label={t(
                                          "tokens:actions.burn.form.addressLabel"
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
                          <form.AppField name={`burn_amount_${idx}`}>
                            {(field) => (
                              <field.BigIntField
                                label={t(
                                  "tokens:actions.burn.form.amountLabel"
                                )}
                                endAddon={asset.symbol}
                                required
                                description={
                                  entry.max
                                    ? t("tokens:actions.burn.form.max", {
                                        max: entry.max[0].toString(),
                                      })
                                    : undefined
                                }
                              />
                            )}
                          </form.AppField>
                        </div>
                        {entries.length > 1 && (
                          <div className="flex justify-end pt-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1 text-xs text-muted-foreground"
                              onClick={() => {
                                setEntries((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                );
                              }}
                            >
                              {t("common:remove")}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEntries((prev) => [
                      ...prev,
                      { address: "" as EthereumAddress, amount: undefined },
                    ]);
                  }}
                  className="text-xs text-muted"
                >
                  {t("tokens:actions.burn.form.addAddress")}
                </Button>
              </div>

              <Card>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("tokens:actions.burn.form.total")}
                    </span>
                    <span className="font-medium">
                      {format(totalBurn)} {asset.symbol}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("tokens:actions.burn.form.hint")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
