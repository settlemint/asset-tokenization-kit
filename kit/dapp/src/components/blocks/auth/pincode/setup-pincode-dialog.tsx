import {
  PincodeForm,
  type PincodeFormValues,
} from "@/components/blocks/auth/pincode/pincode-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "@/i18n/routing";
import { setPincode } from "@/lib/mutations/user/set-pincode-action";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface PincodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetupPincodeDialog({ open, onOpenChange }: PincodeDialogProps) {
  const t = useTranslations(
    "private.auth.wallet-security.setup-pincode-dialog"
  );
  const router = useRouter();

  const onSubmit = async (data: PincodeFormValues) => {
    try {
      await setPincode({
        pincode: data.pincode,
      });
      toast.success(t("pincode-set"));
      router.refresh();
    } catch (error) {
      console.error("Failed to set pincode:", error);
      toast.error(t("pincode-set-error"));
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <PincodeForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
