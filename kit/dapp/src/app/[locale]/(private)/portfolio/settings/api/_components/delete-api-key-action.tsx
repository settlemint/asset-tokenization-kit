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
import { authClient } from "@/lib/auth/client";
import { type KeyboardEvent, type MouseEvent, useState } from "react";
import { toast } from "sonner";

export function DeleteApiKeyAction({
  apiKey,
  open,
  onOpenChange,
}: {
  apiKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDeleteApiKey = async (e?: MouseEvent | KeyboardEvent) => {
    e?.preventDefault();

    try {
      setIsLoading(true);
      await authClient.apiKey.delete({
        keyId: apiKey,
      });
      toast.success("API Key deleted successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        `Failed to delete API Key: ${error instanceof Error ? error.message : "Unknown error"}`
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
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this API Key? This will remove it
              from the platform and block it from being used.
            </DialogDescription>
          </DialogHeader>

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
                handleDeleteApiKey(e).catch((error) => {
                  toast.error(
                    `Failed to delete API Key: ${error instanceof Error ? error.message : "Unknown error"}`
                  );
                });
              }}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete API Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
