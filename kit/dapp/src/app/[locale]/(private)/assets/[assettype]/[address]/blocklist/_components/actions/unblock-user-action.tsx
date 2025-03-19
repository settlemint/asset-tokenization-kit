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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "@/i18n/routing";
import { unblockUser } from "@/lib/mutations/unblock-user/unblock-user-action";
import type { AssetType } from "@/lib/utils/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { type MouseEvent, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";

export function UnblockUserAction({
  userAddress,
  address,
  assettype,
  open,
  onOpenChange,
}: {
  userAddress: Address;
  address: Address;
  assettype: AssetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pincode, setPincode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUnblockUser = async (e: MouseEvent) => {
    e.preventDefault();
    if (!pincode.trim()) {
      toast.error("Please enter your PIN code");
      return;
    }

    try {
      setIsLoading(true);
      await unblockUser({
        address,
        pincode,
        userAddress,
        assettype,
      });
      toast.success("User unblocked successfully");
      onOpenChange(false);
      setPincode("");
      router.refresh();
    } catch (error) {
      toast.error(
        `Failed to unblock user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unblock User</DialogTitle>
          <DialogDescription>
            Are you sure you want to unblock this user? This will allow them to
            perform operations with this asset again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <InputOTP
            minLength={6}
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={pincode}
            onChange={setPincode}
            disabled={isLoading}
            className="justify-center"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-8" />
              <InputOTPSlot index={1} className="size-8" />
              <InputOTPSlot index={2} className="size-8" />
              <InputOTPSlot index={3} className="size-8" />
              <InputOTPSlot index={4} className="size-8" />
              <InputOTPSlot index={5} className="size-8" />
            </InputOTPGroup>
          </InputOTP>
        </div>

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
            onClick={(e) => {
              handleUnblockUser(e).catch((error) => {
                toast.error(
                  `Failed to unblock user: ${error instanceof Error ? error.message : "Unknown error"}`
                );
              });
            }}
            disabled={!pincode.trim() || isLoading}
          >
            {isLoading ? "Unblocking..." : "Unblock User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
