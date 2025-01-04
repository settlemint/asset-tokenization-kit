'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { usePollingInterval } from '@/hooks/use-polling-interval';
import { authClient } from '@/lib/auth/client';
import { shortHex } from '@/lib/hex';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { useQuery } from '@tanstack/react-query';
import { BringToFront, ChevronsUpDown, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { Address } from 'viem';

const GetPendingTransactions = portalGraphql(`
  query GetPendingTransactions($from: String) {
    getPendingTransactions(from: $from) {
      count
    }
  }
`);

export function UserDropdown() {
  const { data: userSession } = authClient.useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const interval = usePollingInterval(5000);
  const router = useRouter();

  const wallet = userSession?.user.wallet as Address | undefined;
  const email = userSession?.user.email;
  const name = userSession?.user.name;

  const { data: pendingCount } = useQuery({
    queryKey: ['pendingtx', email, wallet],
    queryFn: async () => {
      const response = await portalClient.request(GetPendingTransactions, {
        from: wallet,
      });
      if (!response?.getPendingTransactions) {
        return 0;
      }
      return response.getPendingTransactions.count;
    },
    refetchInterval: interval,
  });

  const handleSignOut = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/'); // redirect to login page
        },
      },
    });
  }, [router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex h-12 cursor-pointer items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <AddressAvatar
            address={wallet}
            email={email}
            className="h-8 w-8 rounded-lg"
            indicator={(pendingCount ?? 0) > 0}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            {name || email ? (
              <span className="truncate font-semibold">{name ?? email}</span>
            ) : (
              <Skeleton className="h-4 w-24" />
            )}
            {wallet ? (
              <span className="truncate text-xs">{shortHex(wallet, 12, 8)}</span>
            ) : (
              <Skeleton className="h-3 w-20" />
            )}
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BringToFront />
            <Link href="/issuer/pending-transactions">
              Pending Transactions
              {(pendingCount ?? 0) > 0 && (
                <Badge className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
                  {pendingCount}
                </Badge>
              )}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {resolvedTheme === 'dark' ? (
            <DropdownMenuItem onSelect={() => setTheme('light')}>
              <Sun />
              Switch to light mode
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => setTheme('dark')}>
              <Moon />
              Switch to dark mode
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
