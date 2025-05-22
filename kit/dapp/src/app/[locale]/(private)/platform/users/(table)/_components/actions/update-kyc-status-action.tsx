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
import { updateKycStatus } from "@/lib/mutations/user/update-kyc-status-action";
import type { getUserList } from "@/lib/queries/user/user-list";
import { useTranslations } from "next-intl";
import { type MouseEvent, useState } from "react";
import { toast } from "sonner";

export function UpdateKycStatusAction({
  user,
  open,
  onOpenChange,
}: {
  user: Awaited<ReturnType<typeof getUserList>>[number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("private.users.actions.update-kyc-status");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: MouseEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await updateKycStatus({
        userId: user.id,
        kycVerified: user.kyc_verified_at ? null : new Date().toJSON(),
      });

      toast.success(t("success"));
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        t("error", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {user.kyc_verified_at
                ? t("remove-kyc-status.title")
                : t("set-kyc-status.title")}
            </DialogTitle>
            <DialogDescription>
              {user.kyc_verified_at
                ? t("remove-kyc-status.description", {
                    userName: user.name,
                  })
                : t("set-kyc-status.description", {
                    userName: user.name,
                  })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              variant={user.kyc_verified_at ? "destructive" : "default"}
              onClick={handleStatusChange}
              disabled={isLoading}
            >
              {isLoading
                ? t("buttons.loading")
                : user.kyc_verified_at
                  ? t("buttons.remove")
                  : t("buttons.set")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
