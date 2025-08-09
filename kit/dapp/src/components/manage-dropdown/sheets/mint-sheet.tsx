import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { ActionFormSheet } from "../core/action-form-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { createActionFormStore } from "../core/action-form-sheet.store";
import { toast } from "sonner";
import { orpc } from "@/orpc/orpc-client";
import { add, format, from, greaterThan, lessThanOrEqual, subtract } from "dnum";
import { Web3Address } from "@/components/web3/web3-address";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";

type Entry = { address: EthereumAddress | "" };

interface MintSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
}

export function MintSheet({ open, onOpenChange, asset }: MintSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();

  const { mutateAsync: mint, isPending } = useMutation(
    orpc.token.mint.mutationOptions({
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
    { address: "" as EthereumAddress },
  ]);
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  const form = useAppForm({ onSubmit: () => {} });

  const tokenDecimals = asset.decimals;
  const capRemaining = useMemo(() => {
    const cap = asset.capped?.cap || from(0, tokenDecimals);
    const remaining = subtract(cap, asset.totalSupply);
    return remaining;
  }, [asset.capped, asset.totalSupply, tokenDecimals]);

  const collateralAvailable = useMemo(() => {
    // When collateral feature exists, its available amount is the limit
    return asset.collateral?.collateral ?? from(0, tokenDecimals);
  }, [asset.collateral, tokenDecimals]);

  const overallLimit = useMemo(() => {
    // If both present, take the most restrictive (min). If none, it's unlimited (represented by 0 meaning no limit)
    const withCap = capRemaining;
    const withCol = collateralAvailable;
    // If both zero, treat as unlimited
    if (
      !greaterThan(withCap, from(0, tokenDecimals)) &&
      !greaterThan(withCol, from(0, tokenDecimals))
    ) {
      return undefined; // no limit
    }
    if (!greaterThan(withCap, from(0, tokenDecimals))) return withCol;
    if (!greaterThan(withCol, from(0, tokenDecimals))) return withCap;
    return lessThanOrEqual(withCap, withCol) ? withCap : withCol;
  }, [capRemaining, collateralAvailable, tokenDecimals]);

  // Validation derived from live form values is computed inside the form subscription below

  const handleClose = () => {
    form.reset();
    setEntries([{ address: "" as EthereumAddress }]);
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        const amounts = entries.map(
          (_, i) => (form.getFieldValue(`amount_${i}`) as bigint | undefined) ?? 0n
        );
        const totalRequested = from(
          amounts.reduce((acc, a) => acc + a, 0n),
          tokenDecimals
        );
        const hasValidRows =
          entries.length > 0 &&
          entries.every((_, i) => {
            const addr = form.getFieldValue(`recipient_${i}`) as
              | EthereumAddress
              | "";
            const amt = form.getFieldValue(`amount_${i}`) as bigint | undefined;
            return Boolean(addr) && (amt ?? 0n) > 0n;
          });
        const withinLimit = !overallLimit
          ? true
          : lessThanOrEqual(totalRequested, overallLimit);
        const canContinue = () => hasValidRows && withinLimit;

        // Build confirmation view
        const recipients = entries.map((_, i) =>
          (form.getFieldValue(`recipient_${i}`) as EthereumAddress | "") || ""
        );
        const confirmAmounts = entries.map(
          (_, i) => (form.getFieldValue(`amount_${i}`) as bigint | undefined) ?? 0n
        );
        const totalMint = from(
          confirmAmounts.reduce((acc, a) => acc + a, 0n),
          tokenDecimals
        );
        const newTotalSupply = add(asset.totalSupply, totalMint);

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("tokens:actions.mint.reviewTitle", { defaultValue: "Review mint" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:details.currentSupply", { defaultValue: "Current supply" })}
                  </div>
                  <div className="text-sm font-medium">
                    {format(asset.totalSupply)} {asset.symbol}
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:details.newSupply", { defaultValue: "New supply" })}
                  </div>
                  <div className="text-sm font-medium">
                    {format(newTotalSupply)} {asset.symbol}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  {t("tokens:actions.mint.recipients", { defaultValue: "Recipients" })}
                </div>
                <div className="rounded-md border divide-y">
                  {recipients.map((addr, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="truncate mr-2">
                        {addr ? (
                          <Web3Address
                            address={getEthereumAddress(addr as `0x${string}`)}
                            copyToClipboard
                            size="small"
                            showFullAddress={false}
                          />
                        ) : (
                          t("common:unknown", { defaultValue: "Unknown" })
                        )}
                      </span>
                      <span className="font-medium">
                        {confirmAmounts[i]?.toString()} {asset.symbol}
                      </span>
                    </div>
                  ))}
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
          title={t("tokens:actions.mint.title", {
            defaultValue: "Mint tokens",
          })}
          description={t("tokens:actions.mint.description", {
            defaultValue: "Create new tokens and assign to addresses",
          })}
          submitLabel={t("tokens:actions.mint.submit", {
            defaultValue: "Confirm mint",
          })}
          canContinue={() => canContinue()}
          confirm={confirmView}
          showAssetDetailsOnConfirm={false}
          isSubmitting={isPending}
          onSubmit={async (verification) => {
            const recipients = entries.map(
              (_, i) => form.getFieldValue(`recipient_${i}`) as EthereumAddress
            );
            const amounts = entries.map(
              (_, i) =>
                (form.getFieldValue(`amount_${i}`) as bigint | undefined) ?? 0n
            );

            const promise = mint({
              contract: asset.id,
              recipients,
              amounts,
              verification,
            });

            toast.promise(promise, {
              loading: t("common:saving", {
                defaultValue: "Saving changes...",
              }),
              success: t("common:saved", { defaultValue: "Changes saved" }),
              error: t("common:error", {
                defaultValue: "Failed to save changes",
              }),
            });

            handleClose();
          }}
        >
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("tokens:actions.mint.form.recipients", {
                    defaultValue: "Recipients",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {entries.map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 rounded-lg border p-3"
                  >
                    <AddressSelectOrInputToggle>
                      {({ mode }) => (
                        <>
                          {mode === "select" && (
                            <form.AppField name={`recipient_${idx}`}>
                              {(field) => (
                                <field.AddressSelectField
                                  scope="user"
                                  label={t(
                                    "tokens:actions.mint.form.addressLabel",
                                    { defaultValue: "Address" }
                                  )}
                                  required
                                />
                              )}
                            </form.AppField>
                          )}
                          {mode === "manual" && (
                            <form.AppField name={`recipient_${idx}`}>
                              {(field) => (
                                <field.AddressInputField
                                  label={t(
                                    "tokens:actions.mint.form.addressLabel",
                                    { defaultValue: "Address" }
                                  )}
                                  required
                                />
                              )}
                            </form.AppField>
                          )}
                        </>
                      )}
                    </AddressSelectOrInputToggle>

                    <form.AppField name={`amount_${idx}`}>
                      {(field) => (
                        <field.BigIntField
                          label={t("tokens:actions.mint.form.amountLabel", {
                            defaultValue: "Amount",
                          })}
                          endAddon={asset.symbol}
                          required
                        />
                      )}
                    </form.AppField>

                    {entries.length > 1 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEntries((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                        >
                          {t("common:remove", { defaultValue: "Remove" })}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {overallLimit
                      ? t("tokens:actions.mint.form.limit", {
                          defaultValue: "Limit applies: collateral/cap",
                        })
                      : t("tokens:actions.mint.form.noLimit", {
                          defaultValue: "No protocol limit",
                        })}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEntries((prev) => [
                        ...prev,
                        { address: "" as EthereumAddress },
                      ]);
                    }}
                  >
                    {t("tokens:actions.mint.form.addRecipient", {
                      defaultValue: "Add recipient",
                    })}
                  </Button>
                </div>

                {!withinLimit && (
                  <div className="text-xs text-destructive">
                    {t("tokens:actions.mint.form.overLimit", {
                      defaultValue: "Total amount exceeds allowed limit",
                    })}
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
