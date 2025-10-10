import { RecoveryCodesActions } from "@/components/onboarding/recovery-codes/recovery-codes-actions";
import { RecoveryCodesDisplay } from "@/components/onboarding/recovery-codes/recovery-codes-display";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RecoveryCodesCardProps {
  codes: string[];
  isGenerating: boolean;
  isConfirming: boolean;
  codesConfirmed: boolean;
  generationError: string | null;
  onConfirmCodes: () => void;
  onCodesConfirmedChange: (checked: CheckedState) => void;
  onRegenerateClick: () => void;
  onCopyAll: () => void;
  onDownload: () => void;
}

export function RecoveryCodesCard({
  codes,
  isGenerating,
  isConfirming,
  codesConfirmed,
  generationError,
  onConfirmCodes,
  onCodesConfirmedChange,
  onRegenerateClick,
  onCopyAll,
  onDownload,
}: RecoveryCodesCardProps) {
  const { t } = useTranslation(["user", "common", "onboarding"]);

  return (
    <Card className="flex h-full flex-col lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("wallet.recoveryCodesCard")}
        </CardTitle>
        <CardDescription>
          {t("wallet.recoveryCodesDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {codes.length > 0 ? (
          <div className="space-y-6">
            <RecoveryCodesDisplay
              isGenerating={isGenerating}
              recoveryCodes={codes}
            />
            <RecoveryCodesActions
              onCopyAll={onCopyAll}
              onDownload={onDownload}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirm-stored"
                checked={codesConfirmed}
                onCheckedChange={onCodesConfirmedChange}
              />
              <label
                htmlFor="confirm-stored"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("wallet.confirmRecoveryCodesStored")}
              </label>
            </div>
            <Button
              onClick={onConfirmCodes}
              disabled={!codesConfirmed || isConfirming}
              className="w-full"
            >
              {isConfirming ? t("common:generating") : t("common:continue")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={onRegenerateClick}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating && <RefreshCw className="h-4 w-4 animate-spin" />}
                {t("wallet.regenerateRecoveryCodes")}
              </Button>
              {generationError && (
                <p className="text-center text-sm text-destructive">
                  {generationError}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
