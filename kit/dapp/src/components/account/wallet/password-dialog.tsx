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
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface PasswordDialogProps {
  open: boolean;
  password: string;
  passwordError?: string | null;
  generationError?: string | null;
  isSubmitting: boolean;
  onPasswordChange: (password: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  title?: string;
  description?: string;
  submitLabel?: string;
  submittingLabel?: string;
}

export function PasswordDialog({
  open,
  password,
  passwordError,
  generationError,
  isSubmitting,
  onPasswordChange,
  onCancel,
  onSubmit,
  title,
  description,
  submitLabel,
  submittingLabel,
}: PasswordDialogProps) {
  const { t } = useTranslation(["user", "common"]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {title ?? t("user:wallet.passwordPromptTitle")}
          </DialogTitle>
          <DialogDescription>
            {description ?? t("user:wallet.passwordPromptDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="regenerate-password">
              {t("user:wallet.passwordLabel")}
            </Label>
            <Input
              id="regenerate-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                onPasswordChange(event.target.value);
              }}
              disabled={isSubmitting}
            />
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
          </div>
          {generationError && (
            <p className="text-sm text-destructive">{generationError}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t("common:actions.cancel")}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? (submittingLabel ?? t("common:generating"))
              : (submitLabel ?? t("user:wallet.regenerateRecoveryCodes"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
