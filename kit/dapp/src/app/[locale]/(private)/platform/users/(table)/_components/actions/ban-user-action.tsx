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
import { type KeyboardEvent, type MouseEvent, useState } from "react";
import { toast } from "sonner";

export function BanUserAction({
  user,
  open,
  onOpenChange,
}: {
  user: Awaited<ReturnType<typeof getUserList>>[number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<string>("forever");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getBanExpiresIn = () => {
    switch (banDuration) {
      case "1hour":
        return 1000 * 60 * 60;
      case "1day":
        return 1000 * 60 * 60 * 24;
      case "1week":
        return 1000 * 60 * 60 * 24 * 7;
      case "1month":
        return 1000 * 60 * 60 * 24 * 30;
      default:
        return undefined;
    }
  };

  const handleBanUser = async (e?: MouseEvent | KeyboardEvent) => {
    e?.preventDefault();
    if (!banReason.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      await authClient.admin.banUser({
        userId: user.id,
        banReason: banReason.trim(),
        banExpiresIn: getBanExpiresIn(),
      });
      toast.success("User banned successfully");
      onOpenChange(false);
      setBanReason("");
      router.refresh();
    } catch (error) {
      toast.error(
        `Failed to ban user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbanUser = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await authClient.admin.unbanUser({
        userId: user.id,
      });
      toast.success("User unbanned successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        `Failed to unban user: ${error instanceof Error ? error.message : "Unknown error"}`
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
              {user.banned ? "Unban" : "Ban"} {user.name}
            </DialogTitle>
            {user.banned ? (
              <DialogDescription>
                Are you sure you want to unban {user.name}? This will remove
                their ban status and allow them to access the platform again.
              </DialogDescription>
            ) : (
              <DialogDescription>
                Enter a reason for banning {user.name}. This will be recorded
                and visible to administrators.
              </DialogDescription>
            )}
          </DialogHeader>

          {!user.banned && (
            <div className="space-y-4">
              <Input
                placeholder="Enter ban reason..."
                required
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && banReason.trim()) {
                    handleBanUser(e).catch((error) => {
                      toast.error(
                        `Failed to ban user: ${error instanceof Error ? error.message : "Unknown error"}`
                      );
                    });
                  }
                }}
              />

              <Select
                value={banDuration}
                onValueChange={setBanDuration}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ban duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forever">Forever</SelectItem>
                  <SelectItem value="1hour">1 Hour</SelectItem>
                  <SelectItem value="1day">1 Day</SelectItem>
                  <SelectItem value="1week">1 Week</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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
              variant="destructive"
              onClick={(e) => {
                if (user.banned) {
                  handleUnbanUser(e).catch((error) => {
                    toast.error(
                      `Failed to unban user: ${error instanceof Error ? error.message : "Unknown error"}`
                    );
                  });
                } else {
                  handleBanUser(e).catch((error) => {
                    toast.error(
                      `Failed to ban user: ${error instanceof Error ? error.message : "Unknown error"}`
                    );
                  });
                }
              }}
              disabled={!banReason.trim() || isLoading}
            >
              {isLoading ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
