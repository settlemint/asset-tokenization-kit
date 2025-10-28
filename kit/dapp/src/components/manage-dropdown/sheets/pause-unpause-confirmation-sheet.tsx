import { invalidateTokenActionQueries } from "@/components/manage-dropdown/core/invalidate-token-action-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";

interface PauseUnpauseConfirmationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
}

export function PauseUnpauseConfirmationSheet({
  open,
  onOpenChange,
  asset,
}: PauseUnpauseConfirmationSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const queryClient = useQueryClient();
  const isPaused = asset.pausable.paused;
  const action = isPaused ? "unpause" : "pause";

  const title =
    action === "pause"
      ? t("tokens:actions.pause.title")
      : t("tokens:actions.unpause.title");
  const description =
    action === "pause"
      ? t("tokens:actions.pause.description")
      : t("tokens:actions.unpause.description");
  const submit =
    action === "pause"
      ? t("tokens:actions.pause.submit")
      : t("tokens:actions.unpause.submit");

  // Pause mutation
  const { mutateAsync: pauseAsset, isPending: isPausing } = useMutation(
    orpc.token.pause.mutationOptions({
      onSuccess: () =>
        invalidateTokenActionQueries(queryClient, {
          tokenAddress: asset.id,
        }),
    })
  );

  // Unpause mutation
  const { mutateAsync: unpauseAsset, isPending: isUnpausing } = useMutation(
    orpc.token.unpause.mutationOptions({
      onSuccess: async () => {
        // Invalidate both single asset and list queries
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.token.read.queryKey({
              input: { tokenAddress: asset.id },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.token.list.key(),
          }),
        ]);
      },
    })
  );

  const handleSubmit = (walletVerification: UserVerification) => {
    if (action === "pause") {
      toast.promise(
        pauseAsset({
          contract: asset.id,
          walletVerification,
        }),
        {
          success: t("tokens:actions.pause.messages.success", {
            name: asset.name,
            symbol: asset.symbol,
          }),
          error: (data) => t("common:error", { message: data.message }),
          loading: t("tokens:actions.pause.messages.submitting"),
        }
      );
    } else {
      toast.promise(
        unpauseAsset({
          contract: asset.id,
          walletVerification,
        }),
        {
          success: t("tokens:actions.unpause.messages.success", {
            name: asset.name,
            symbol: asset.symbol,
          }),
          error: (data) => t("common:error", { message: data.message }),
          loading: t("tokens:actions.unpause.messages.submitting"),
        }
      );
    }
    handleClose();
  };

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // kept for API parity; ActionFormSheet handles cancel via onOpenChange
  // no-op

  return (
    <ActionFormSheet
      open={open}
      onOpenChange={onOpenChange}
      asset={asset}
      title={title}
      description={description}
      submitLabel={submit}
      hasValuesStep={false}
      isSubmitting={isPausing || isUnpausing}
      showAssetDetailsOnConfirm={false}
      confirm={
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("tokens:details.stateChange")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-1 text-center">
                <div className="text-xs text-muted-foreground mb-2">
                  {t("tokens:details.currentState")}
                </div>
                <div
                  className={`text-sm font-medium ${
                    isPaused ? "text-destructive" : "text-success"
                  }`}
                >
                  {isPaused
                    ? t("tokens:status.paused")
                    : t("tokens:status.active")}
                </div>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

              <div className="flex-1 text-center">
                <div className="text-xs text-muted-foreground mb-2">
                  {t("tokens:details.targetState")}
                </div>
                <div
                  className={`text-sm font-medium ${
                    action === "pause" ? "text-destructive" : "text-success"
                  }`}
                >
                  {action === "pause"
                    ? t("tokens:status.paused")
                    : t("tokens:status.active")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      }
      onSubmit={(v) => {
        handleSubmit(v);
      }}
    />
  );
}
