import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

export const WalletSecurityMethodOptions = {
  Pincode: "pincode",
  TwoFactorAuthentication: "two-factor-authentication",
} as const;

export type WalletSecurityMethod =
  (typeof WalletSecurityMethodOptions)[keyof typeof WalletSecurityMethodOptions];

interface WalletSecurityMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (method: WalletSecurityMethod) => void;
}

export function WalletSecurityMethodDialog({
  open,
  onOpenChange,
  onSelect,
}: WalletSecurityMethodDialogProps) {
  const t = useTranslations("private.auth.wallet-security.security-method");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            onClick={() => onSelect(WalletSecurityMethodOptions.Pincode)}
          >
            {t("pincode")}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              onSelect(WalletSecurityMethodOptions.TwoFactorAuthentication)
            }
          >
            {t("two-factor-authentication")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
