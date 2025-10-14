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

export interface PasswordDialogCopy {
  title: string;
  description: string;
  submitLabel: string;
  submittingLabel: string;
}

// Reusable confirmation dialog that collects the user's current password
// before allowing sensitive wallet and security mutations to proceed.
interface PasswordDialogProps {
  open: boolean;
  password: string;
  passwordError?: string | null;
  generationError?: string | null;
  isSubmitting: boolean;
  onPasswordChange: (password: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  copy?: Partial<PasswordDialogCopy>;
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
  copy,
}: PasswordDialogProps) {
  const { t } = useTranslation("common");
  const title = copy?.title ?? t("password-confirmation.title");
  const description =
    copy?.description ?? t("password-confirmation.description");
  const submitLabel = copy?.submitLabel ?? t("password-confirmation.submit");
  const submittingLabel =
    copy?.submittingLabel ?? t("password-confirmation.submitting");
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          onCancel();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="regenerate-password">
              {t("password-confirmation.passwordLabel")}
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
            {t("password-confirmation.cancel")}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
