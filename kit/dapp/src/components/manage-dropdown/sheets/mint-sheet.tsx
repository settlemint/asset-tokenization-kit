import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { invalidateTokenActionQueries } from "@/components/manage-dropdown/core/invalidate-token-action-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Web3Address } from "@/components/web3/web3-address";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
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
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

/**
 * Represents a single recipient entry in the mint form.
 * Each entry has a unique ID for React key management and form field naming.
 */
type Entry = { id: string };

/**
 * Props for the MintSheet component.
 */
interface MintSheetProps {
  /** Controls sheet visibility */
  open: boolean;
  /** Callback when sheet open state changes */
  onOpenChange: (open: boolean) => void;
  /** Token to mint new supply for */
  asset: Token;
}

/**
 * Token minting interface with advanced validation and multi-recipient support.
 *
 * @remarks
 * BUSINESS LOGIC: Implements complex token minting rules that respect both supply caps
 * and collateral limits. These constraints are critical for regulatory compliance and
 * financial security in asset tokenization platforms.
 *
 * VALIDATION HIERARCHY:
 * 1. Supply Cap: Maximum total supply limit (if token is capped)
 * 2. Collateral Limit: Available collateral backing the mint (if collateralized)
 * 3. Multi-recipient validation: Each entry must have valid address and amount
 *
 * PERFORMANCE: Uses dnum library for high-precision decimal arithmetic to avoid
 * floating-point errors in financial calculations. All amounts are handled as BigInt
 * with proper decimal scaling.
 *
 * UX FEATURES:
 * - Dynamic recipient management (add/remove entries)
 * - Real-time limit validation with visual feedback
 * - Total calculation with remaining limit display
 * - Confirmation step with before/after supply comparison
 *
 * SECURITY: Requires wallet verification for final execution, preventing unauthorized
 * token creation which could impact tokenomics and regulatory compliance.
 */
export function MintSheet({ open, onOpenChange, asset }: MintSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();

  // BLOCKCHAIN: Mutation for minting tokens with automatic cache invalidation
  const { mutateAsync: mint, isPending } = useMutation(
    orpc.token.mint.mutationOptions({
      onSuccess: async (_, variables) => {
        const recipients = Array.isArray(variables.recipients)
          ? variables.recipients
          : [variables.recipients];

        await invalidateTokenActionQueries(qc, {
          tokenAddress: asset.id,
          holderAddresses: recipients as EthereumAddress[],
        });
      },
    })
  );

  // UTILITY: Generate unique IDs for recipient entries using secure methods when available
  const newEntry = (): Entry => ({
    id:
      // SECURITY: Prefer crypto.randomUUID() for better entropy when available
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
  });

  // STATE: Manage dynamic list of mint recipients
  const [entries, setEntries] = useState<Entry[]>([newEntry()]);
  // STORE: Persistent store for stepper state (shared across re-renders)
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  // FORM: Initialize form without validation schema (validation is computed dynamically)
  const form = useAppForm({ onSubmit: () => {} });

  // LIFECYCLE: Reset form and state when sheet opens to ensure clean slate
  useEffect(() => {
    if (open) {
      setEntries([newEntry()]);
      form.reset();
      // RESET: Return to values step in case user reopens after previous session
      sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    }
  }, [open, form]);

  const tokenDecimals = asset.decimals;

  // BUSINESS LOGIC: Calculate remaining supply capacity if token has a cap
  const capRemaining = useMemo(() => {
    const cap = asset.capped?.cap || from(0, tokenDecimals);
    const remaining = subtract(cap, asset.totalSupply);
    return remaining;
  }, [asset.capped, asset.totalSupply, tokenDecimals]);

  // COLLATERAL: Determine available collateral backing for new mints
  const collateralAvailable = useMemo(() => {
    // FINANCIAL: When collateral feature exists, its available amount limits minting
    // This ensures tokens are always backed by sufficient collateral
    return asset.collateral?.collateral ?? from(0, tokenDecimals);
  }, [asset.collateral, tokenDecimals]);

  // CONSTRAINT RESOLUTION: Calculate the most restrictive limit between cap and collateral
  const overallLimit = useMemo(() => {
    // LOGIC: Take the minimum of all applicable limits to ensure compliance
    const withCap = capRemaining;
    const withCol = collateralAvailable;

    // EDGE CASE: If both limits are zero or undefined, token has unlimited minting
    if (
      !greaterThan(withCap, from(0, tokenDecimals)) &&
      !greaterThan(withCol, from(0, tokenDecimals))
    ) {
      return undefined; // no limit
    }

    // SINGLE CONSTRAINT: Return the active limit if only one applies
    if (!greaterThan(withCap, from(0, tokenDecimals))) return withCol;
    if (!greaterThan(withCol, from(0, tokenDecimals))) return withCap;

    // DUAL CONSTRAINT: Return the more restrictive limit
    return lessThanOrEqual(withCap, withCol) ? withCap : withCol;
  }, [capRemaining, collateralAvailable, tokenDecimals]);

  // WHY: Validation is computed inside form subscription to react to live form values
  // This ensures real-time feedback as user inputs amounts and addresses

  // CLEANUP: Reset all form state when sheet closes
  const handleClose = () => {
    form.reset();
    setEntries([newEntry()]);
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        // AGGREGATION: Extract all amounts from dynamic form fields
        const amounts = entries.map(
          (e) =>
            (form.getFieldValue(`amount_${e.id}`) as Dnum | undefined) ??
            from(0n, tokenDecimals)
        );

        // CALCULATION: Sum total mint amount using high-precision arithmetic
        const totalRequested = amounts.reduce(
          (acc, amount) => add(acc, amount, tokenDecimals),
          from(0n, tokenDecimals)
        );

        // VALIDATION: Ensure each row has valid address and positive amount
        const hasValidRows =
          entries.length > 0 &&
          entries.every((e) => {
            const addr = form.getFieldValue(`recipient_${e.id}`) as
              | EthereumAddress
              | "";
            const amt = form.getFieldValue(`amount_${e.id}`) as
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

        // CONSTRAINT: Check if total request respects overall minting limits
        const withinLimit = overallLimit
          ? lessThanOrEqual(totalRequested, overallLimit)
          : true;

        // GUARD: Combine all validation rules to determine if user can proceed
        const canContinue = () => hasValidRows && withinLimit;

        // CONFIRMATION: Prepare data for the confirmation step display
        const recipients = entries.map(
          (e) =>
            (form.getFieldValue(`recipient_${e.id}`) as EthereumAddress | "") ||
            ""
        );
        const confirmAmounts = entries.map(
          (e) =>
            (form.getFieldValue(`amount_${e.id}`) as Dnum | undefined) ??
            from(0n, tokenDecimals)
        );
        const totalMint = confirmAmounts.reduce(
          (acc, amount) => add(acc, amount, tokenDecimals),
          from(0n, tokenDecimals)
        );
        // PROJECTION: Show user the new total supply after minting
        const newTotalSupply = add(asset.totalSupply, totalMint, tokenDecimals);

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
                            size="small"
                          />
                        ) : (
                          t("common:unknown")
                        )}
                      </span>
                      <span className="font-medium">
                        {format(confirmAmounts[i] ?? from(0n, tokenDecimals))}{" "}
                        {asset.symbol}
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
                  (form.getFieldValue(`amount_${e.id}`) as Dnum | undefined) ??
                  from(0n, tokenDecimals)
              );
              const promise = mint({
                contract: asset.id,
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
                              <field.DnumField
                                label={t(
                                  "tokens:actions.mint.form.amountLabel"
                                )}
                                endAddon={asset.symbol}
                                decimals={asset.decimals}
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
