import { BaseActionSheet } from "@/components/manage-dropdown/core/base-action-sheet";
import { invalidateTokenActionQueries } from "@/components/manage-dropdown/core/invalidate-token-action-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationButton } from "@/components/verification-dialog/verification-button";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ClaimYieldSheetProps {
  open: boolean;
  onClose: () => void;
  assetBalance: {
    token: Pick<Token, "id" | "name" | "symbol" | "yield">;
  };
}

export function ClaimYieldSheet({
  open,
  onClose,
  assetBalance,
}: ClaimYieldSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const qc = useQueryClient();

  const yieldSchedule = assetBalance.token.yield?.schedule;
  const denominationAsset = yieldSchedule?.denominationAsset;

  const { mutateAsync: claimYield, isPending } = useMutation(
    orpc.fixedYieldSchedule.claim.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          invalidateTokenActionQueries(qc, {
            tokenAddress: assetBalance.token.id,
            includeUserAssets: true,
          }),
          qc.invalidateQueries({
            queryKey: orpc.fixedYieldSchedule.read.queryOptions({
              input: { id: yieldSchedule?.id ?? "" },
            }).queryKey,
          }),
          qc.invalidateQueries({
            queryKey: orpc.token.read.queryOptions({
              input: { tokenAddress: denominationAsset?.id ?? "" },
            }).queryKey,
          }),
        ]);
      },
    })
  );

  const handleSubmit = useCallback(
    (verification: UserVerification) => {
      const promise = claimYield({
        contract: yieldSchedule?.id ?? "",
        walletVerification: verification,
      });

      toast
        .promise(promise, {
          loading: t("tokens:actions.claimYield.toasts.loading"),
          success: t("tokens:actions.claimYield.toasts.success"),
          error: (error) =>
            t("tokens:actions.claimYield.toasts.error", {
              error: error.message,
            }),
        })
        .unwrap()
        .then(() => {
          onClose();
        })
        .catch(() => undefined);
    },
    [claimYield, t, yieldSchedule?.id, onClose]
  );

  return (
    <BaseActionSheet
      open={open}
      onOpenChange={onClose}
      asset={assetBalance.token}
      title={t("tokens:actions.claimYield.title")}
      description={t("tokens:actions.claimYield.description")}
      submit={
        <VerificationButton
          disabled={isPending}
          walletVerification={{
            title: t("tokens:actions.claimYield.title"),
            description: t("tokens:actions.claimYield.description"),
          }}
          onSubmit={handleSubmit}
        >
          {t("tokens:actions.claimYield.submit")}
        </VerificationButton>
      }
      onCancel={onClose}
      isSubmitting={isPending}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("tokens:actions.claimYield.subTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm font-medium">
            {denominationAsset?.id ? (
              <Web3Address
                address={denominationAsset.id}
                copyToClipboard
                showFullAddress={false}
                showPrettyName={true}
                showBadge={false}
                size="tiny"
                className="font-mono text-sm"
              />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </BaseActionSheet>
  );
}
