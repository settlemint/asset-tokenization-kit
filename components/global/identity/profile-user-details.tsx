"use client";

import { Button } from "@/components/ui/button";
import { shortHex } from "@/lib/utils";
import { useCallback } from "react";
import { toast } from "sonner";
import { ProfileAvatar } from "./profile-avatar";

export function ProfileUserDetails({
  wallet,
  email,
  pendingCount,
}: {
  wallet?: string;
  email?: string;
  pendingCount?: number;
}) {
  const handleCopyWallet = useCallback(() => {
    if (!wallet) {
      toast.error("No wallet address available");
      return;
    }

    navigator.clipboard
      .writeText(wallet)
      .then(() => toast.success("Wallet address copied to clipboard"))
      .catch(() => toast.error("Failed to copy wallet address"));
  }, [wallet]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <ProfileAvatar wallet={wallet} email={email} pendingCount={pendingCount} />
      <div className="pt-4 font-bold">{email}</div>
      <Button
        variant="link"
        size="sm"
        className="mt-1 p-0 h-auto text-xs font-normal"
        onClick={handleCopyWallet}
        aria-label="Copy wallet address to clipboard"
      >
        {shortHex(wallet)}
      </Button>
    </div>
  );
}
