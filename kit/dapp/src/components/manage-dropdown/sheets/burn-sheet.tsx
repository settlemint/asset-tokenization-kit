import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Web3Address } from "@/components/web3/web3-address";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Dnum } from "dnum";
import { format, from, lessThanOrEqual, subtract } from "dnum";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

type Entry = { id: string; max?: Dnum; address?: EthereumAddress };

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
        
        // Refresh holders data to show updated balances
        await qc.invalidateQueries({
          queryKey: orpc.token.holders.queryOptions({
            input: { tokenAddress: asset.id },
          }).queryKey,
        });
      },
    })
  );

  // Fetch holders data to get balances for addresses
  const { data: holdersData } = useQuery(
    orpc.token.holders.queryOptions({
      input: { tokenAddress: asset.id },
      enabled: open,
    })
  );

  const newEntry = (max?: Dnum, address?: EthereumAddress): Entry => ({
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto.randomUUID() as string)
        : Math.random().toString(36).slice(2),
    max,
    address,
  });

  const [entries, setEntries] = useState<Entry[]>([
    newEntry(preset?.available, preset?.address),
  ]);
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  const form = useAppForm({ onSubmit: () => {} });

  // Sync entries state with preset and open props to prevent stale data
  useEffect(() => {
    if (open) {
      const initialEntry = newEntry(preset?.available, preset?.address);
      setEntries([initialEntry]);
      form.reset();
      // Prefill the address field if preset has an address
      if (preset?.address) {
        form.setFieldValue(`burn_address_${initialEntry.id}`, preset.address);
      }
      sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    }
  }, [open, preset, form]);

  const tokenDecimals = asset.decimals;

  // Remove the automatic max update - we'll calculate it dynamically
  // This prevents confusion with duplicate addresses

  // This is no longer needed - we'll check actual entries instead
  // const presetHasBalance = useMemo(() => {
  //   if (!preset?.available) return true; // if unknown, don't block
  //   return preset.available[0] > 0n;
  // }, [preset]);

  const handleClose = () => {
    form.reset();
    setEntries([newEntry(preset?.available, preset?.address)]);
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        // Aggregate amounts by address to properly validate duplicate addresses
        const addressAmounts = new Map<string, bigint>();
        const addressEntryCount = new Map<string, number>();

        entries.forEach((e) => {
          const addr = form.getFieldValue(`burn_address_${e.id}`) as
            | EthereumAddress
            | "";
          const amt =
            (form.getFieldValue(`burn_amount_${e.id}`) as bigint | undefined) ??
            0n;
          if (addr && amt > 0n) {
            const lowerAddr = addr.toLowerCase();
            addressAmounts.set(
              lowerAddr,
              (addressAmounts.get(lowerAddr) ?? 0n) + amt
            );
            addressEntryCount.set(
              lowerAddr,
              (addressEntryCount.get(lowerAddr) ?? 0) + 1
            );
          }
        });

        // Validate that all entries have addresses and amounts
        const hasValidEntries =
          entries.length > 0 &&
          entries.every((e) => {
            const addr = form.getFieldValue(`burn_address_${e.id}`) as
              | EthereumAddress
              | "";
            const amt = form.getFieldValue(`burn_amount_${e.id}`) as
              | bigint
              | undefined;
            return Boolean(addr) && (amt ?? 0n) > 0n;
          });

        // Validate that aggregated amounts don't exceed available balances
        const withinBalanceLimits = [...addressAmounts.entries()].every(
          ([addr, totalAmt]) => {
            const holderBalance = holdersData?.token?.balances?.find(
              (b) => b.account?.id.toLowerCase() === addr
            );
            if (!holderBalance) return true; // If we don't have balance data, allow it
            return lessThanOrEqual(
              from(totalAmt, tokenDecimals),
              holderBalance.available
            );
          }
        );

        const canContinue = () => hasValidEntries && withinBalanceLimits;

        const totalBurn = from(
          entries
            .map(
              (e) =>
                (form.getFieldValue(`burn_amount_${e.id}`) as
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
                  {entries.map((e) => {
                    const addr = form.getFieldValue(
                      `burn_address_${e.id}`
                    ) as EthereumAddress | null;
                    const amt =
                      (form.getFieldValue(`burn_amount_${e.id}`) as
                        | bigint
                        | undefined) ?? 0n;
                    return (
                      <div
                        key={e.id}
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
            store={sheetStoreRef.current}
            onSubmit={(verification) => {
              const addresses = entries.map(
                (e) =>
                  form.getFieldValue(`burn_address_${e.id}`) as EthereumAddress
              );
              const amounts = entries.map(
                (e) =>
                  (form.getFieldValue(`burn_amount_${e.id}`) as
                    | bigint
                    | undefined) ?? 0n
              );

              const promise = burn({
                contract: asset.id,
                addresses,
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
                        {(() => {
                          // Check if this entry exceeds available balance
                          const addr = form.getFieldValue(
                            `burn_address_${entry.id}`
                          ) as EthereumAddress | "";
                          const amt =
                            (form.getFieldValue(`burn_amount_${entry.id}`) as
                              | bigint
                              | undefined) ?? 0n;

                          if (!addr || amt === 0n) return null;

                          const lowerAddr = addr.toLowerCase();
                          const totalForAddress =
                            addressAmounts.get(lowerAddr) ?? 0n;
                          const holderBalance =
                            holdersData?.token?.balances?.find(
                              (b) => b.account?.id.toLowerCase() === lowerAddr
                            );

                          if (
                            holderBalance &&
                            totalForAddress > holderBalance.available[0]
                          ) {
                            return (
                              <div className="text-destructive text-xs mb-2 p-2 bg-destructive/10 rounded">
                                {`Total burn amount (${totalForAddress.toString()}) exceeds available balance (${holderBalance.available[0].toString()})`}
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <div>
                          <AddressSelectOrInputToggle>
                            {({ mode }) => (
                              <>
                                {mode === "select" && (
                                  <form.AppField
                                    name={`burn_address_${entry.id}`}
                                  >
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
                                  <form.AppField
                                    name={`burn_address_${entry.id}`}
                                  >
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
                          <form.AppField name={`burn_amount_${entry.id}`}>
                            {(field) => (
                              <field.BigIntField
                                label={t(
                                  "tokens:actions.burn.form.amountLabel"
                                )}
                                endAddon={asset.symbol}
                                required
                                description={(() => {
                                  const addr = form.getFieldValue(
                                    `burn_address_${entry.id}`
                                  ) as EthereumAddress | "";
                                  if (!addr) return undefined;

                                  const lowerAddr = addr.toLowerCase();
                                  const holderBalance =
                                    holdersData?.token?.balances?.find(
                                      (b) =>
                                        b.account?.id.toLowerCase() ===
                                        lowerAddr
                                    );

                                  if (!holderBalance) return undefined;

                                  // Calculate how much is already allocated to this address in other entries
                                  let allocatedAmount = 0n;
                                  entries.forEach((otherEntry) => {
                                    if (otherEntry.id === entry.id) return;
                                    const otherAddr = form.getFieldValue(
                                      `burn_address_${otherEntry.id}`
                                    ) as EthereumAddress | "";
                                    const otherAmt =
                                      (form.getFieldValue(
                                        `burn_amount_${otherEntry.id}`
                                      ) as bigint | undefined) ?? 0n;
                                    if (
                                      otherAddr?.toLowerCase() === lowerAddr
                                    ) {
                                      allocatedAmount += otherAmt;
                                    }
                                  });

                                  const availableForThisEntry =
                                    holderBalance.available[0] -
                                    allocatedAmount;
                                  const isDuplicate =
                                    (addressEntryCount.get(lowerAddr) ?? 0) > 1;

                                  if (availableForThisEntry <= 0n) {
                                    return "No balance left for this address";
                                  }

                                  return isDuplicate
                                    ? `Available: ${availableForThisEntry.toString()} (Total balance: ${holderBalance.available[0].toString()})`
                                    : t("tokens:actions.burn.form.max", {
                                        max: availableForThisEntry.toString(),
                                      });
                                })()}
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
                                // Clear form values related to the removed row
                                form.setFieldValue(
                                  `burn_address_${entry.id}`,
                                  undefined as unknown as EthereumAddress
                                );
                                form.setFieldValue(
                                  `burn_amount_${entry.id}`,
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
