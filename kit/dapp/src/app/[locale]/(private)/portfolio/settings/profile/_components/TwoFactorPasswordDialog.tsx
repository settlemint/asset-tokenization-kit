import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface TwoFactorPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => Promise<void>;
  isLoading: boolean;
  twoFactorEnabled: boolean;
}

export function TwoFactorPasswordDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  twoFactorEnabled,
}: TwoFactorPasswordDialogProps) {
  const t = useTranslations(
    "portfolio.settings.profile.two-factor-authentication.enter-password"
  );
  const [password, setPassword] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder={t("placeholder")}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && password.trim()) {
                e.preventDefault();
                onSubmit(password);
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button
            variant={twoFactorEnabled ? "destructive" : "default"}
            onClick={(e) => {
              e.preventDefault();
              onSubmit(password).finally(() => {
                setPassword("");
              });
            }}
            disabled={!password.trim() || isLoading}
          >
            {isLoading ? t("loading") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
