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
import { removePincode } from "@/lib/mutations/user/remove-pincode-action";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

interface PincodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemovePincodeDialog({
  open,
  onOpenChange,
}: PincodeDialogProps) {
  const t = useTranslations(
    "portfolio.settings.profile.pincode.remove-pincode"
  );
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      await removePincode();
      toast.success(t("success-message"));
      router.refresh();
    } catch (error) {
      console.error("Failed to remove pincode:", error);
      toast.error(t("error-message"));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? t("loading") : t("remove")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
