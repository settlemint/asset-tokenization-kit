import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Web3Address } from "@/components/web3/web3-address";
import { useAppForm } from "@/hooks/use-app-form";
import { FormatCurrency } from "@/lib/utils/format-value/format-currency";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  add,
  type Dnum,
  format,
  from,
  greaterThan,
  lessThanOrEqual,
  subtract,
} from "dnum";
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
          queryKey: orpc.token.read.queryKey({
            input: { tokenAddress: asset.id },
          }),
        });

        // Refresh holders data to show updated balances
        await qc.invalidateQueries({
          queryKey: orpc.token.holders.queryKey({
            input: { tokenAddress: asset.id },
          }),
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
        const addressAmounts = new Map<string, Dnum>();
        const addressEntryCount = new Map<string, number>();

        entries.forEach((e) => {
          const addr = form.getFieldValue(`burn_address_${e.id}`) as
            | EthereumAddress
            | "";
          const amt =
            (form.getFieldValue(`burn_amount_${e.id}`) as Dnum | undefined) ??
            from(0n, tokenDecimals);
          if (addr && greaterThan(amt, from(0n, tokenDecimals))) {
            const lowerAddr = addr.toLowerCase();
            addressAmounts.set(
              lowerAddr,
              add(addressAmounts.get(lowerAddr) ?? from(0n, tokenDecimals), amt)
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
              | Dnum
              | undefined;
            return (
              Boolean(addr) &&
              greaterThan(
                amt ?? from(0n, tokenDecimals),
                from(0n, tokenDecimals)
              )
            );
          });

        // Validate that aggregated amounts don't exceed available balances
        const withinBalanceLimits = [...addressAmounts.entries()].every(
          ([addr, totalAmt]) => {
            const holderBalance = holdersData?.token?.balances?.find(
              (b) => b.account?.id.toLowerCase() === addr
            );
            if (!holderBalance) return true; // If we don't have balance data, allow it
            return lessThanOrEqual(totalAmt, holderBalance.available);
          }
        );

        const canContinue = () => hasValidEntries && withinBalanceLimits;

        const totalBurn = entries
          .map(
            (e) =>
              (form.getFieldValue(`burn_amount_${e.id}`) as Dnum | undefined) ??
              from(0n, tokenDecimals)
          )
          .reduce((acc, amount) => add(acc, amount), from(0n, tokenDecimals));

        const newTotalSupply = subtract(
          asset.totalSupply,
          totalBurn,
          tokenDecimals
        );

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
                        | Dnum
                        | undefined) ?? from(0n, tokenDecimals);
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
                          {format(amt)} {asset.symbol}
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
                    | Dnum
                    | undefined) ?? from(0n, tokenDecimals)
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
                              | Dnum
                              | undefined) ?? from(0n, tokenDecimals);

                          if (
                            !addr ||
                            !greaterThan(amt, from(0n, tokenDecimals))
                          )
                            return null;

                          const lowerAddr = addr.toLowerCase();
                          const totalForAddress =
                            addressAmounts.get(lowerAddr) ??
                            from(0n, tokenDecimals);
                          const holderBalance =
                            holdersData?.token?.balances?.find(
                              (b) => b.account?.id.toLowerCase() === lowerAddr
                            );

                          if (
                            holderBalance &&
                            greaterThan(
                              totalForAddress,
                              holderBalance.available
                            )
                          ) {
                            return (
                              <div className="text-destructive text-xs mb-2 p-2 bg-destructive/10 rounded">
                                {`Total burn amount (${format(totalForAddress)}) exceeds available balance (${format(holderBalance.available)})`}
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
                            {(field) => {
                              const footer = () => {
                                const addr = form.getFieldValue(
                                  `burn_address_${entry.id}`
                                ) as EthereumAddress | "";
                                if (!addr) return undefined;

                                const lowerAddr = addr.toLowerCase();
                                const holderBalance =
                                  holdersData?.token?.balances?.find(
                                    (b) =>
                                      b.account?.id.toLowerCase() === lowerAddr
                                  );

                                if (!holderBalance) return undefined;

                                // Calculate how much is already allocated to this address in other entries
                                let allocatedAmount = from(0n, tokenDecimals);
                                entries.forEach((otherEntry) => {
                                  if (otherEntry.id === entry.id) return;
                                  const otherAddr = form.getFieldValue(
                                    `burn_address_${otherEntry.id}`
                                  ) as EthereumAddress | "";
                                  const otherAmt =
                                    (form.getFieldValue(
                                      `burn_amount_${otherEntry.id}`
                                    ) as Dnum | undefined) ??
                                    from(0n, tokenDecimals);
                                  if (otherAddr?.toLowerCase() === lowerAddr) {
                                    allocatedAmount = add(
                                      allocatedAmount,
                                      otherAmt
                                    );
                                  }
                                });

                                const availableHolderBalance =
                                  holderBalance.available;
                                const availableForThisEntry = subtract(
                                  availableHolderBalance,
                                  allocatedAmount
                                );
                                const isDuplicate =
                                  (addressEntryCount.get(lowerAddr) ?? 0) > 1;

                                if (
                                  lessThanOrEqual(
                                    availableForThisEntry,
                                    from(0n, tokenDecimals)
                                  )
                                ) {
                                  return "No balance left for this address";
                                }

                                return isDuplicate ? (
                                  <div className="flex items-center gap-1">
                                    Available:
                                    <FormatCurrency
                                      value={availableForThisEntry}
                                      options={{
                                        currency: {
                                          assetSymbol: asset.symbol,
                                        },
                                        type: "currency",
                                      }}
                                    />
                                    Total balance:
                                    <FormatCurrency
                                      value={availableHolderBalance}
                                      options={{
                                        currency: {
                                          assetSymbol: asset.symbol,
                                        },
                                        type: "currency",
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    Max:
                                    <FormatCurrency
                                      value={availableForThisEntry}
                                      options={{
                                        currency: {
                                          assetSymbol: asset.symbol,
                                        },
                                        type: "currency",
                                      }}
                                    />
                                  </div>
                                );
                              };

                              const description = footer();
                              return (
                                <>
                                  <field.DnumField
                                    label={t(
                                      "tokens:actions.burn.form.amountLabel"
                                    )}
                                    endAddon={asset.symbol}
                                    decimals={asset.decimals}
                                    required
                                  />
                                  <div className="text-xs text-muted-foreground ml-2 mt-2">
                                    {description}
                                  </div>
                                </>
                              );
                            }}
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
                                  undefined as unknown as Dnum
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
