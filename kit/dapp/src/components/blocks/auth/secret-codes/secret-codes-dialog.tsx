import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <SecretCodesForm />
      </DialogContent>
    </Dialog>
  );
}
