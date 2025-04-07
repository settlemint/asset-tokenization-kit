import { CopySecretCodes } from "@/components/blocks/auth/secret-codes/copy-secret-codes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SecretCodesForm } from "./secret-codes-form";

interface TwoFactorBackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SecretCodesDialog({
  open,
  onOpenChange,
}: TwoFactorBackupCodesDialogProps) {
  const t = useTranslations("portfolio.settings.profile.secret-codes");
  const [secretCodes, setSecretCodes] = useState<string[]>([]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <SecretCodesForm onSecretCodesChange={setSecretCodes} />
        <DialogFooter>
          <CopySecretCodes secretCodes={secretCodes} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
