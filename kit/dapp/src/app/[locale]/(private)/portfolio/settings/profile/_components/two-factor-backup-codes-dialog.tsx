import { TwoFactorPasswordDialog } from "@/app/[locale]/(private)/portfolio/settings/profile/_components/two-factor-password-dialog";
import { CopyTwoFactorBackupCodes } from "@/components/blocks/auth/two-factor/copy-two-tactor-backup-codes";
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

interface TwoFactorBackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorBackupCodesDialog({
  open,
  onOpenChange,
}: TwoFactorBackupCodesDialogProps) {
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnteringPassword, setIsEnteringPassword] = useState(true);
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication.backup-codes"
  );

  const onPasswordSubmit = async (password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await authClient.twoFactor.generateBackupCodes({
        password,
      });
      if (error) {
        toast.error(
          t("error-message", {
            error: error.message ?? "Unknown error",
          })
        );
      } else {
        setIsEnteringPassword(false);
        setBackupCodes(data?.backupCodes ?? []);
      }
    } catch (error) {
      toast.error(
        t("error-message", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open && !isEnteringPassword} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <ul className="mt-4 space-y-2 text-sm">
            {backupCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <DialogFooter>
            <CopyTwoFactorBackupCodes backupCodes={backupCodes} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TwoFactorPasswordDialog
        open={open && isEnteringPassword}
        onOpenChange={setIsEnteringPassword}
        onSubmit={onPasswordSubmit}
        isLoading={isLoading}
        submitButtonText={t("generate")}
      />
    </>
  );
}
