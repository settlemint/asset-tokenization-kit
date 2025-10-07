import { LanguageSwitcher } from "@/components/language/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
import { Web3Avatar } from "@/components/web3/web3-avatar";
import { authClient } from "@/lib/auth/auth.client";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  Fingerprint,
  LogOut,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import { useCallback } from "react";

export function UserDropdown() {
  const navigate = useNavigate();

  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  const displayName = user?.name;

  const navigateTo = useCallback(
    (to: "/profile" | "/wallet" | "/onchain-identity") => {
      void navigate({ to });
    },
    [navigate]
  );

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    await navigate({
      to: "/auth/$pathname",
      params: { pathname: "sign-in" },
    });
  }, [navigate]);

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
            name={displayName}
            address={user?.wallet}
            size="small"
          />
          <div className="hidden sm:grid flex-1 text-left text-sm leading-tight">
            {displayName ? (
              <span className="truncate font-medium">{displayName}</span>
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
              name={displayName}
              address={user?.wallet}
              size="small"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              {displayName ? (
                <span className="truncate font-medium">{displayName}</span>
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
          {accountMenuItems.map(({ path, icon: Icon, label }) => (
            <DropdownMenuItem
              key={path}
              className="cursor-pointer"
              onSelect={() => navigateTo(path)}
            >
              <Icon className="size-4" /> {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <LanguageSwitcher mode="menuItem" />
          <ThemeToggle mode="menuItem" />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
