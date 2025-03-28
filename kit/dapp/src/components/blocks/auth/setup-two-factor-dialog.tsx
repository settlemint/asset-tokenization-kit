import { TwoFactorPasswordDialog } from "@/app/[locale]/(private)/portfolio/settings/profile/_components/two-factor-password-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { CopyTwoFactorBackupCodes } from "./copy-two-tactor-backup-codes";

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
  const [twoFactorData, setTwoFactorData] = useState<{
    totpURI: string;
    backupCodes: string[];
  } | null>(null);

  const enableTwoFactorAuthentication = async (password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await authClient.twoFactor.enable({
        password,
      });
      if (error) {
        toast.error(
          t("enable.error-message", {
            error: error.message ?? "Unknown error",
          })
        );
      } else {
        setTwoFactorData(data);
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

  const onMfaSetupFinished = async () => {
    try {
      setIsLoading(true);
      const { error } = await authClient.twoFactor.verifyTotp({
        code: firstOtp,
      });
      if (error) {
        toast.error(
          t("enable.error-message", {
            error: error.message ?? "Unknown error",
          })
        );
      } else {
        setFirstOtp("");
        onOpenChange(false);
        toast.success(t("enable.success-message"));
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
      <Dialog open={open && !!twoFactorData} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("setup-mfa.title")}</DialogTitle>
            <DialogDescription>{t("setup-mfa.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center w-full">
              <QRCode
                className="rounded-md bg-muted p-4"
                value={twoFactorData?.totpURI ?? ""}
                size={256}
              />
            </div>
            <label className="flex justify-center w-full text-md font-semibold">
              {t("setup-mfa.enter-code-title")}
            </label>
            <div className="flex justify-center w-full pb-6">
              <InputOTP maxLength={6} value={firstOtp} onChange={setFirstOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <DialogFooter>
            <div className="flex w-full justify-between items-center">
              <div>
                <CopyTwoFactorBackupCodes
                  backupCodes={twoFactorData?.backupCodes ?? []}
                />
              </div>
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
                    onMfaSetupFinished();
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
      <TwoFactorPasswordDialog
        open={open && !twoFactorData}
        onOpenChange={onOpenChange}
        onSubmit={enableTwoFactorAuthentication}
        isLoading={isLoading}
        submitButtonText={t("enable.title")}
      />
    </>
  );
}
