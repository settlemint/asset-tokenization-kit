import { BaseActionSheet } from "@/components/manage-dropdown/base-action-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PauseUnpauseConfirmationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
  action: "pause" | "unpause";
  onProceed: () => void;
  onCancel: () => void;
}

export function PauseUnpauseConfirmationSheet({
  open,
  onOpenChange,
  asset,
  action,
  onProceed,
  onCancel,
}: PauseUnpauseConfirmationSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const isPaused = asset.pausable.paused;

  return (
    <BaseActionSheet
      open={open}
      onOpenChange={onOpenChange}
      asset={asset}
      title={
        action === "pause"
          ? t("tokens:actions.pause.title")
          : t("tokens:actions.unpause.title")
      }
      description={
        action === "pause"
          ? t("tokens:actions.pause.description")
          : t("tokens:actions.unpause.description")
      }
      onProceed={onProceed}
      onCancel={onCancel}
    >
      {/* State Change Visualization Card */}
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
    </BaseActionSheet>
  );
}
