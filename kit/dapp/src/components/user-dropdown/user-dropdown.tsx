import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Web3Avatar } from "@/components/web3-avatar/web3-avatar";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

export function UserDropdown({
  user,
}: {
  user?: {
    name?: string;
    email?: string;
    address?: string;
  };
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 gap-2 px-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
        >
          <Web3Avatar
            email={user?.email}
            name={user?.name}
            address={user?.address}
            size={32}
            className="h-8 w-8"
          />
          <div className="hidden sm:grid flex-1 text-left text-sm leading-tight">
            {user?.name ? (
              <span className="truncate font-medium">{user.name}</span>
            ) : (
              <Skeleton className="h-4 w-24" />
            )}
            {user?.email ? (
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            ) : (
              <Skeleton className="h-3 w-32 mt-1" />
            )}
          </div>
          <ChevronsUpDown className="ml-1 size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Web3Avatar
              email={user?.email}
              name={user?.name}
              address={user?.address}
              size={32}
              className="h-8 w-8"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              {user?.name ? (
                <span className="truncate font-medium">{user.name}</span>
              ) : (
                <Skeleton className="h-4 w-24" />
              )}
              {user?.email ? (
                <span className="truncate text-xs">{user.email}</span>
              ) : (
                <Skeleton className="h-3 w-32 mt-1" />
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
