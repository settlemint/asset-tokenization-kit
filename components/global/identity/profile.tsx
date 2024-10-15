"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { portalClient, portalGraphql } from "@/lib/settlemint/clientside/portal";
import * as m from "@/paraglide/messages";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import type { Address } from "viem";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileLanguage } from "./profile-language";
import { PendingTx } from "./profile-pending-tx";
import { PendingTxTable } from "./profile-pending-tx-table";
import { ProfileSignOut } from "./profile-signout";
import { ProfileTheme } from "./profile-theme";
import { ProfileUserDetails } from "./profile-user-details";

const GetPendingTransactions = portalGraphql(`
  query GetPendingTransactions($from: String) {
    getPendingTransactions(from: $from) {
      count
    }
  }`);

export function Profile() {
  const session = useSession();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wallet = session.data?.user.wallet as Address | undefined;

  const { data: pendingCount } = useQuery({
    queryKey: ["pendingtx", wallet],
    queryFn: async () => {
      const response = await portalClient.request(GetPendingTransactions, {
        from: wallet,
      });
      if (!response?.getPendingTransactions) {
        return 0;
      }
      return response.getPendingTransactions.count;
    },
    refetchInterval: 1000,
  });

  const handleOpenSheet = () => {
    setIsSheetOpen(true);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <ProfileAvatar
            pendingCount={pendingCount}
            email={session.data?.user.email ?? ""}
            wallet={session.data?.user.wallet}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          <ProfileUserDetails email={session.data?.user.email ?? ""} wallet={wallet} />
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <PendingTx pendingCount={pendingCount} onOpenSheet={handleOpenSheet} />
            <ProfileTheme />
            <ProfileLanguage />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ProfileSignOut />
        </DropdownMenuContent>
      </DropdownMenu>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="min-w-[800px]">
          <SheetHeader>
            <SheetTitle>{m.equal_alert_butterfly_fetch()}</SheetTitle>
            <SheetDescription>{m.last_mean_mink_endure()}</SheetDescription>
          </SheetHeader>
          <PendingTxTable from={wallet} />
          <SheetFooter className="mt-4">
            <SheetClose asChild>
              <Button>{m.neat_many_bee_pinch()}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
