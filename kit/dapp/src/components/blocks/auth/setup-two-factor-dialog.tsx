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
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { CopyTwoFactorBackupCodes } from "./copy-two-tactor-backup-codes";
import { TwoFactorOTPInput } from "./two-factor-otp-input";

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
        setFirstOtp("");
        onOpenChange(false);
        toast.success(t("enable.success-message"));
        if (refreshOnSuccess) {
          router.refresh();
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
              <TwoFactorOTPInput value={firstOtp} onChange={setFirstOtp} />
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
