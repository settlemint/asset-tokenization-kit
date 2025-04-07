import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { SetupTwoFactorForm } from "./setup-two-factor-form";

interface SetupTwoFactorDialogProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  refreshOnSuccess?: boolean;
}

export function SetupTwoFactorDialog({
  onOpenChange,
  open,
  refreshOnSuccess = false,
}: SetupTwoFactorDialogProps) {
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication"
  );
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [firstOtp, setFirstOtp] = useState("");

  const onSetupFinished = async () => {
    try {
      setIsLoading(true);
      const result = await authClient.twoFactor.verifyTotp({
        code: firstOtp,
      });
      const { error } = result;
      if (error) {
        toast.error(
          t("enable.error-message", {
            error: error.message ?? "Unknown error",
          })
        );
      } else {
        toast.success(t("enable.success-message"));
        if (refreshOnSuccess) {
          router.refresh();
        } else {
          setFirstOtp("");
          onOpenChange(false);
        }
      }
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("setup-mfa.title")}</DialogTitle>
            <DialogDescription>{t("setup-mfa.description")}</DialogDescription>
          </DialogHeader>
          <SetupTwoFactorForm
            firstOtp={firstOtp}
            onFirstOtpChange={setFirstOtp}
          />
          <DialogFooter>
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-2">
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
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
