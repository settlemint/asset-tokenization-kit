"use client";

import { shortHex } from "@/lib/utils";
import { ProfileAvatar } from "./profile-avatar";

export function ProfileUserDetails({
  wallet,
  email,
  pendingCount,
}: { wallet?: string; email?: string; pendingCount?: number }) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <ProfileAvatar wallet={wallet} email={email} pendingCount={pendingCount} />
      <div className="pt-4 font-bold">{email}</div>
      <div className="mt-1 text-xs">{shortHex(wallet)}</div>
    </div>
  );
}
