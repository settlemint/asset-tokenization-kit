import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "../../../../lib/auth/client";
import { PasswordDialog } from "../password-dialog";

interface PincodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisablePincodeDialog({
  open,
  onOpenChange,
}: PincodeDialogProps) {
  const t = useTranslations(
    "portfolio.settings.profile.pincode.disable-pincode"
  );
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await authClient.pincode.disable({
        password,
      });
      if (error) {
        throw new Error(error.message);
      }
      toast.success(t("success-message"));
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      const error = err as Error;
      console.error("Failed to disable pincode:", error);
      toast.error(t("error-message", { error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <PasswordDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isLoading={isLoading}
      submitButtonVariant="destructive"
      submitButtonText={t("remove")}
      description={t("description")}
    />
  );
}
