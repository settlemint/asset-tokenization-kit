"use client";

import { AddressAvatar } from "@/components/ui/address-avatar/address-avatar";
import { type HTMLAttributes, forwardRef } from "react";

interface ProfileAvatarProps extends HTMLAttributes<HTMLDivElement> {
  wallet?: string;
  email?: string;
  pendingCount?: number;
}

export const ProfileAvatar = forwardRef<HTMLDivElement, ProfileAvatarProps>(
  ({ wallet, email, pendingCount, ...props }, ref) => {
    return (
      <AddressAvatar
        ref={ref}
        address={wallet}
        email={email}
        className="h-10 w-10"
        badge={(pendingCount ?? 0) > 0}
        {...props}
      />
    );
  },
);

ProfileAvatar.displayName = "ProfileAvatar";
