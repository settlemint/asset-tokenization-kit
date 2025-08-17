import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Web3Address } from "@/components/web3/web3-address";
import { useAppForm } from "@/hooks/use-app-form";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  add,
  format,
  from,
  greaterThan,
  lessThanOrEqual,
  subtract,
} from "dnum";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

type Entry = { id: string };

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

  const newEntry = (): Entry => ({
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto.randomUUID() as string)
        : Math.random().toString(36).slice(2),
  });

  const [entries, setEntries] = useState<Entry[]>([newEntry()]);
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  const form = useAppForm({ onSubmit: () => {} });

  // Reset state when sheet opens
  useEffect(() => {
    if (open) {
      setEntries([newEntry()]);
      form.reset();
      sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    }
  }, [open, form]);

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
    setEntries([newEntry()]);
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        const amounts = entries.map(
          (e) =>
            (form.getFieldValue(`amount_${e.id}`) as bigint | undefined) ?? 0n
        );
        const totalRequested = from(
          amounts.reduce((acc, a) => acc + a, 0n),
          tokenDecimals
        );
        const hasValidRows =
          entries.length > 0 &&
          entries.every((e) => {
            const addr = form.getFieldValue(`recipient_${e.id}`) as
              | EthereumAddress
              | "";
            const amt = form.getFieldValue(`amount_${e.id}`) as
              | bigint
              | undefined;
            return Boolean(addr) && (amt ?? 0n) > 0n;
          });
        const withinLimit = overallLimit
          ? lessThanOrEqual(totalRequested, overallLimit)
          : true;
        const canContinue = () => hasValidRows && withinLimit;

        // Build confirmation view
        const recipients = entries.map(
          (e) =>
            (form.getFieldValue(`recipient_${e.id}`) as EthereumAddress | "") ||
            ""
        );
        const confirmAmounts = entries.map(
          (e) =>
            (form.getFieldValue(`amount_${e.id}`) as bigint | undefined) ?? 0n
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
                {t("tokens:actions.mint.reviewTitle")}
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
                  {t("tokens:actions.mint.recipients")}
                </div>
                <div className="rounded-md border divide-y">
                  {recipients.map((addr, i) => (
                    <div
                      key={entries[i]?.id ?? i}
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
            title={t("tokens:actions.mint.title")}
            description={t("tokens:actions.mint.description")}
            submitLabel={t("tokens:actions.mint.submit")}
            canContinue={canContinue}
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            isSubmitting={isPending}
            store={sheetStoreRef.current}
            onSubmit={(verification) => {
              const recipients = entries.map(
                (e) =>
                  form.getFieldValue(`recipient_${e.id}`) as EthereumAddress
              );
              const amounts = entries.map(
                (e) =>
                  (form.getFieldValue(`amount_${e.id}`) as
                    | bigint
                    | undefined) ?? 0n
              );

              const promise = mint({
                contract: asset.id,
                recipients,
                amounts,
                walletVerification: verification,
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
                {entries.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent>
                      <div className="relative space-y-2">
                        <div>
                          <AddressSelectOrInputToggle>
                            {({ mode }) => (
                              <>
                                {mode === "select" && (
                                  <form.AppField name={`recipient_${entry.id}`}>
                                    {(field) => (
                                      <field.AddressSelectField
                                        scope="user"
                                        label={t(
                                          "tokens:actions.mint.form.addressLabel"
                                        )}
                                        required
                                      />
                                    )}
                                  </form.AppField>
                                )}
                                {mode === "manual" && (
                                  <form.AppField name={`recipient_${entry.id}`}>
                                    {(field) => (
                                      <field.AddressInputField
                                        label={t(
                                          "tokens:actions.mint.form.addressLabel"
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
                          <form.AppField name={`amount_${entry.id}`}>
                            {(field) => (
                              <field.BigIntField
                                label={t(
                                  "tokens:actions.mint.form.amountLabel"
                                )}
                                endAddon={asset.symbol}
                                required
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
                                // Clear field values for the removed row to avoid stale data
                                form.setFieldValue(
                                  `recipient_${entry.id}`,
                                  undefined as unknown as EthereumAddress
                                );
                                form.setFieldValue(
                                  `amount_${entry.id}`,
                                  undefined as unknown as bigint
                                );
                                setEntries((prev) =>
                                  prev.filter((e) => e.id !== entry.id)
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
                    setEntries((prev) => [...prev, newEntry()]);
                  }}
                  className="text-xs text-muted"
                >
                  {t("tokens:actions.mint.form.addRecipient")}
                </Button>
              </div>

              <Card>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("tokens:actions.mint.form.total")}
                    </span>
                    <span className="font-medium">
                      {format(totalRequested)} {asset.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("tokens:actions.mint.form.limitLabel")}</span>
                    <span>
                      {overallLimit
                        ? `${format(overallLimit)} ${asset.symbol}`
                        : t("tokens:actions.mint.form.noLimit")}
                    </span>
                  </div>
                  {!withinLimit && (
                    <div className="text-xs text-destructive">
                      {t("tokens:actions.mint.form.overLimit")}
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
