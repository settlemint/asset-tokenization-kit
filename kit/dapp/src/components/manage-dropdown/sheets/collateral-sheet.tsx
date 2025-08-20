import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, from, greaterThan, subtract } from "dnum";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";
import { AlertCircle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CollateralSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
}

/**
 * Collateral management interface for updating token collateral claims.
 *
 * @remarks
 * This component allows authorized issuers to manage collateral claims for tokens.
 * Collateral claims act as supply caps, ensuring tokens are backed by sufficient assets.
 *
 * SECURITY: Only trusted claim issuers can update collateral claims
 * VALIDATION: New collateral must be greater than current total supply
 * COMPLIANCE: Claims are issued through the OnchainID identity system
 */
export function CollateralSheet({
  open,
  onOpenChange,
  asset,
}: CollateralSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();

  // Collateral management mutation
  const { mutateAsync: updateCollateral, isPending } = useMutation(
    orpc.token.updateCollateral.mutationOptions({
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

  const tokenDecimals = asset.decimals;

  // Current collateral status
  const currentCollateral = useMemo(() => {
    return asset.collateral?.collateral ?? from(0, tokenDecimals);
  }, [asset.collateral, tokenDecimals]);

  const currentSupply = asset.totalSupply;

  // Calculate how much collateral is currently being used
  const collateralUtilization = useMemo(() => {
    if (!greaterThan(currentCollateral, from(0, tokenDecimals))) {
      return 0;
    }
    const utilization =
      (Number(currentSupply[0]) / Number(currentCollateral[0])) * 100;
    return Math.min(100, Math.round(utilization));
  }, [currentCollateral, currentSupply, tokenDecimals]);

  const handleClose = () => {
    form.reset();
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  return (
    <form.Subscribe selector={(s) => s}>
      {() => {
        const newAmount =
          (form.getFieldValue("collateralAmount") as bigint | undefined) ?? 0n;
        const expiryDays =
          (form.getFieldValue("expiryDays") as number | undefined) ?? 90;

        const newCollateral = from(newAmount, tokenDecimals);
        const isValidAmount = greaterThan(newCollateral, currentSupply);

        const canContinue = () =>
          newAmount > 0n && isValidAmount && expiryDays > 0;

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("tokens:actions.collateral.reviewTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:actions.collateral.current")}
                  </div>
                  <div className="text-sm font-medium">
                    {format(currentCollateral)} {asset.symbol}
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-2">
                    {t("tokens:actions.collateral.new")}
                  </div>
                  <div className="text-sm font-medium">
                    {format(newCollateral)} {asset.symbol}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("tokens:actions.collateral.expiryDate")}
                  </span>
                  <span className="font-medium">
                    {expiryDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("tokens:actions.collateral.availableForMinting")}
                  </span>
                  <span className="font-medium">
                    {format(subtract(newCollateral, currentSupply))}{" "}
                    {asset.symbol}
                  </span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t("tokens:actions.collateral.claimNote")}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={handleClose}
            asset={asset}
            title={t("tokens:actions.collateral.title")}
            description={t("tokens:actions.collateral.description")}
            submitLabel={t("tokens:actions.collateral.submit")}
            canContinue={canContinue}
            confirm={confirmView}
            showAssetDetailsOnConfirm={false}
            isSubmitting={isPending}
            store={sheetStoreRef.current}
            onSubmit={async (verification) => {
              const promise = updateCollateral({
                contract: asset.id,
                amount: newAmount,
                expiryDays,
                walletVerification: verification,
              });

              toast.promise(promise, {
                loading: t("common:saving"),
                success: t("tokens:actions.collateral.success"),
                error: t("common:error"),
              });

              handleClose();
            }}
          >
            <div className="space-y-4">
              {/* Current Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {t("tokens:actions.collateral.currentStatus")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("tokens:actions.collateral.currentCollateral")}
                    </span>
                    <span className="font-medium">
                      {format(currentCollateral)} {asset.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("tokens:details.currentSupply")}
                    </span>
                    <span className="font-medium">
                      {format(currentSupply)} {asset.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("tokens:actions.collateral.utilization")}
                    </span>
                    <span className="font-medium">
                      {collateralUtilization}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${collateralUtilization}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* New Collateral Form */}
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    <form.AppField name="collateralAmount">
                      {(field) => (
                        <field.BigIntField
                          label={t(
                            "tokens:actions.collateral.form.amountLabel"
                          )}
                          description={t(
                            "tokens:actions.collateral.form.amountDescription"
                          )}
                          endAddon={asset.symbol}
                          required
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="expiryDays">
                      {(field) => (
                        <field.NumberField
                          label={t(
                            "tokens:actions.collateral.form.expiryLabel"
                          )}
                          description={t(
                            "tokens:actions.collateral.form.expiryDescription"
                          )}
                          endAddon={t("common:days")}
                          required
                        />
                      )}
                    </form.AppField>

                    {!isValidAmount && newAmount > 0n && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {t("tokens:actions.collateral.form.amountTooLow")}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Information Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t("tokens:actions.collateral.info")}
                </AlertDescription>
              </Alert>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
