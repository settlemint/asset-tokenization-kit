import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { SetupTwoFactorForm } from "./setup-two-factor-form";

interface SetupTwoFactorDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SetupTwoFactorDialog({
  onOpenChange,
  open,
}: SetupTwoFactorDialogProps) {
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [firstOtp, setFirstOtp] = useState("");

  const onSetupFinished = async () => {
    try {
      setIsLoading(true);
      const { error } = await authClient.twoFactor.verifyTotp({
        code: firstOtp,
      });
      if (error) {
        throw new Error(error.message);
      }
      toast.success(t("enable.success-message"));
      setFirstOtp("");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        t("enable.error-message", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("setup-mfa.title")}</DialogTitle>
          <DialogDescription>{t("setup-mfa.description")}</DialogDescription>
        </DialogHeader>
        <SetupTwoFactorForm
          firstOtp={firstOtp}
          onFirstOtpChange={setFirstOtp}
          onOpenChange={onOpenChange}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            {t("setup-mfa.cancel")}
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onSetupFinished();
            }}
            disabled={!firstOtp.trim() || isLoading}
          >
            {isLoading ? t("setup-mfa.loading") : t("setup-mfa.enable")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
