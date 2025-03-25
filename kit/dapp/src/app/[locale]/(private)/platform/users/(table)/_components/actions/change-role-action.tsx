import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import type { getUserList } from "@/lib/queries/user/user-list";
import { userRoles } from "@/lib/utils/typebox/user-roles";
import { useTranslations } from "next-intl";
import { type MouseEvent, useState } from "react";
import { toast } from "sonner";

export function ChangeRoleAction({
  user,
  open,
  onOpenChange,
}: {
  user: Awaited<ReturnType<typeof getUserList>>[number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("private.users");
  const [selectedRole, setSelectedRole] = useState<string>(user.role || "user");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (e: MouseEvent) => {
    e.preventDefault();
    if (selectedRole === user.role) {
      return;
    }

    try {
      setIsLoading(true);
      await authClient.admin.setRole({
        userId: user.id,
        role: selectedRole,
      });
      toast.success(t("change-role.success"));
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        t("change-role.error", {
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
            <DialogTitle>{t("change-role.title")}</DialogTitle>
            <DialogDescription>
              {t("change-role.description", {
                userName: user.name,
              })}
            </DialogDescription>
          </DialogHeader>

          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("change-role.select-role")} />
            </SelectTrigger>
            <SelectContent>
              {userRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {t(`roles.${role}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              {t("change-role.actions.cancel")}
            </Button>
            <Button
              variant="default"
              onClick={handleRoleChange}
              disabled={selectedRole === user.role || isLoading}
            >
              {isLoading
                ? t("change-role.actions.loading")
                : t("change-role.actions.change")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
