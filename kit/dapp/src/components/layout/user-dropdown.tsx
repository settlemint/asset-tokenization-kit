'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { ThemeMenuItem } from '@/components/blocks/theme/theme-menu-item';
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
import { ChevronDown, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback } from 'react';
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
    enabled: !!wallet,
    initialData: 0,
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

  if (!userSession) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex h-12 cursor-pointer items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Suspense fallback={<Skeleton className="h-8 w-8 rounded-lg" />}>
            <AddressAvatar
              address={wallet}
              email={email}
              className="h-8 w-8 rounded-lg"
              indicator={(pendingCount ?? 0) > 0}
            />
          </Suspense>
          <div className="grid flex-1 text-left text-sm leading-tight">
            {name || email ? (
              <span className="truncate font-semibold">{name ?? email}</span>
            ) : (
              <Skeleton className="h-4 w-24" />
            )}
            {wallet ? (
              <span className="truncate text-xs">{shortHex(wallet, { prefixLength: 12, suffixLength: 8 })}</span>
            ) : (
              <Skeleton className="h-3 w-20" />
            )}
          </div>
          <ChevronDown className="ml-2 size-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-0 shadow-dropdown"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        {/* <DropdownMenuGroup>
          <DropdownMenuItem className="dropdown-menu-item">
            <BringToFront className="mr-2 size-4" />
            <Link href="/issuer/pending-transactions" prefetch>
              Pending Transactions
              {(pendingCount ?? 0) > 0 && (
                <Badge className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
                  {pendingCount}
                </Badge>
              )}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup> */}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <ThemeMenuItem />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut} className="dropdown-menu-item">
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
