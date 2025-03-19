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
        role: selectedRole as "user" | "issuer" | "admin",
      });
      toast.success("User role updated successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        `Failed to update role: ${error instanceof Error ? error.message : "Unknown error"}`
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
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for {user.name}. This will change their
              permissions in the system.
            </DialogDescription>
          </DialogHeader>

          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="issuer">Issuer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={(e) => {
                handleRoleChange(e).catch((error) => {
                  toast.error(
                    `Failed to update role: ${error instanceof Error ? error.message : "Unknown error"}`
                  );
                });
              }}
              disabled={selectedRole === user.role || isLoading}
            >
              {isLoading ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
