import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invalidateTokenActionQueries } from "@/components/manage-dropdown/core/invalidate-token-action-queries";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../core/action-form-sheet";

interface MatureConfirmationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
}

export function MatureConfirmationSheet({
  open,
  onOpenChange,
  asset,
}: MatureConfirmationSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const queryClient = useQueryClient();

  const title = t("tokens:actions.mature.title");
  const description = t("tokens:actions.mature.description");
  const submit = t("tokens:actions.mature.submit");

  // Mature mutation
  const { mutateAsync: matureAsset, isPending: isMaturing } = useMutation(
    orpc.token.mature.mutationOptions({
      onSuccess: async () => {
        await invalidateTokenActionQueries(queryClient, {
          tokenAddress: asset.id,
        });
      },
    })
  );

  const handleSubmit = (walletVerification: UserVerification) => {
    toast
      .promise(
        matureAsset({
          contract: asset.id,
          walletVerification,
        }),
        {
          success: t("tokens:actions.mature.messages.success", {
            name: asset.name,
            symbol: asset.symbol,
          }),
          error: (data) => t("common:error", { message: data.message }),
          loading: t("tokens:actions.mature.messages.submitting"),
        }
      )
      .unwrap()
      .then(() => {
        handleClose();
      })
      .catch(() => undefined);
  };

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <ActionFormSheet
      open={open}
      onOpenChange={onOpenChange}
      asset={asset}
      title={title}
      description={description}
      submitLabel={submit}
      hasValuesStep={false}
      isSubmitting={isMaturing}
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
                <div className="text-sm font-medium text-foreground">
                  {t("tokens:status.active")}
                </div>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

              <div className="flex-1 text-center">
                <div className="text-xs text-muted-foreground mb-2">
                  {t("tokens:details.targetState")}
                </div>
                <div className="text-sm font-medium text-success">
                  {t("tokens:status.matured")}
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
