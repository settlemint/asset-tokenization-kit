"use client";

import { signOutAction } from "@/app/auth/signout/actions/sign-out";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import * as m from "@/paraglide/messages";
import { LogOut } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

export function ProfileSignOut() {
  const handleSignOut = useCallback(async () => {
    try {
      await signOutAction({});
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  }, []);

  return (
    <DropdownMenuItem onClick={handleSignOut} aria-label="Sign out">
      <LogOut className="mr-2 h-4 w-4" />
      <span>{m.mealy_major_fish_climb()}</span>
    </DropdownMenuItem>
  );
}
