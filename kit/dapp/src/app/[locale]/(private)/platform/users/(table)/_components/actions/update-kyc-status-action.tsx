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
import type { getUserList } from "@/lib/queries/user/user-list";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { type MouseEvent, useState } from "react";
import { toast } from "sonner";

const UpdateKycStatusMutation = hasuraGraphql(`
  mutation UpdateKycStatus($userId: String!, $kycVerified: timestamptz) {
    update_user_by_pk(pk_columns: {id: $userId}, _set: {kyc_verified_at: $kycVerified}) {
      id
      kyc_verified_at
    }
  }
`);

export function UpdateKycStatusAction({
  user,
  open,
  onOpenChange,
}: {
  user: Awaited<ReturnType<typeof getUserList>>[number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: MouseEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await hasuraClient.request(UpdateKycStatusMutation, {
        userId: user.id,
        kycVerified: user.kyc_verified_at ? null : new Date().toJSON(),
      });

      toast.success("KYC status updated successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        `Failed to update KYC status: ${error instanceof Error ? error.message : "Unknown error"}`
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
              {user.kyc_verified_at ? "Remove KYC Verification" : "Verify KYC"}
            </DialogTitle>
            <DialogDescription>
              {user.kyc_verified_at
                ? `Are you sure you want to remove KYC verification for ${user.name}?`
                : `Are you sure you want to verify KYC for ${user.name}?`}
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
              variant={user.kyc_verified_at ? "destructive" : "default"}
              onClick={(e) => {
                handleStatusChange(e).catch((error) => {
                  toast.error(
                    `Failed to update KYC status: ${error instanceof Error ? error.message : "Unknown error"}`
                  );
                });
              }}
              disabled={isLoading}
            >
              {isLoading
                ? "Updating..."
                : user.kyc_verified_at
                  ? "Remove Verification"
                  : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
