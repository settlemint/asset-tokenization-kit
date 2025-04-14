import { SetupWalletSecurityForm } from "@/components/blocks/auth/setup-wallet-security-form/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WalletSecurityMethodOptions } from "@/lib/mutations/user/wallet/setup-wallet-security-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";

export type WalletSecurityMethod =
  (typeof WalletSecurityMethodOptions)[keyof typeof WalletSecurityMethodOptions];

interface WalletSecuritySetupDialogProps {
  open: boolean;
  onSetupComplete: () => void;
}

export function WalletSecuritySetupDialog({
  open,
  onSetupComplete,
}: WalletSecuritySetupDialogProps) {
  const t = useTranslations("private.auth.wallet-security.form.setup");
  const [isSettingUp, setIsSettingUp] = useState(false);

  return (
    <Dialog open={open}>
      <DialogContent>
        {isSettingUp ? (
          <div className="flex flex-col gap-4">
            <SetupWalletSecurityForm onSetupComplete={onSetupComplete} />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsSettingUp(true)}>
                {t("button-label")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
