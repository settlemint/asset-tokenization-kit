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
import { AlertTriangle } from "lucide-react";
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
  const [selectedRole, setSelectedRole] = useState<"user" | "issuer" | "admin">(
    user.role || "user"
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Check if the user is editing their own role
  const isSelfRoleChange = session?.user?.id === user.id;

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
      toast.success(t("actions.change-role.success"));
      onOpenChange(false);

      // If the user changed their own role to a non-admin role, redirect to dashboard
      if (isSelfRoleChange && selectedRole !== "admin") {
        router.push("/assets");
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(
        t("actions.change-role.error", {
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
            <DialogTitle>{t("actions.change-role.title")}</DialogTitle>
            <DialogDescription>
              {t("actions.change-role.description", {
                userName: user.name,
              })}

              {isSelfRoleChange && selectedRole !== "admin" && (
                <span className="mt-2 p-3 rounded-md border bg-warning/10 border-warning/20 text-sm text-warning-foreground flex items-start gap-2">
                  <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
                  <span>{t("actions.change-role.self-change-warning")}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <Select
            value={selectedRole}
            onValueChange={(value) =>
              setSelectedRole(value as "user" | "issuer" | "admin")
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("actions.change-role.select-role")} />
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
              {t("actions.change-role.buttons.cancel")}
            </Button>
            <Button
              variant="default"
              onClick={handleRoleChange}
              disabled={selectedRole === user.role || isLoading}
            >
              {isLoading
                ? t("actions.change-role.buttons.loading")
                : t("actions.change-role.buttons.change")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
