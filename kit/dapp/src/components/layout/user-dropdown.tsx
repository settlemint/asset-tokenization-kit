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
import { authClient } from '@/lib/auth/client';
import { usePendingTransactions } from '@/lib/queries/transactions/transactions-pending';
import { cn } from '@/lib/utils';
import { shortHex } from '@/lib/utils/hex';
import { BookOpenText, BringToFront, ChevronDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useUser } from '../blocks/user-context/user-context';
import { Badge } from '../ui/badge';

// Custom text component that renders either content or a skeleton with consistent DOM structure
function TextOrSkeleton({
  condition,
  children,
  className,
  skeletonClassName,
}: {
  condition: boolean;
  children: React.ReactNode;
  className?: string;
  skeletonClassName?: string;
}) {
  return (
    <span className={className}>
      {condition ? (
        children
      ) : (
        <span className={cn('block', skeletonClassName)}>
          <Skeleton className="h-full w-full" />
        </span>
      )}
    </span>
  );
}

export function UserDropdown() {
  const user = useUser();
  const router = useRouter();
  // Use client-side only rendering for user data to avoid hydration mismatches
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: pendingCount } = usePendingTransactions({
    address: user?.wallet,
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

  // Don't render anything on the server to avoid hydration mismatches
  if (!isClient) {
    return (
      <div className="flex h-12 items-center gap-2 rounded-md px-2 text-sm">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
        <ChevronDown className="ml-2 size-4" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex h-12 cursor-pointer items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Suspense fallback={<Skeleton className="h-8 w-8 rounded-lg" />}>
            {user ? (
              <AddressAvatar
                address={user.wallet}
                email={user.email}
                className="h-8 w-8 rounded-lg"
                indicator={(pendingCount ?? 0) > 0}
              />
            ) : (
              <Skeleton className="h-8 w-8 rounded-lg" />
            )}
          </Suspense>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <TextOrSkeleton
              condition={Boolean(user?.name || user?.email)}
              className="truncate font-semibold"
              skeletonClassName="h-4 w-24"
            >
              {user?.name ?? user?.email}
            </TextOrSkeleton>

            <TextOrSkeleton
              condition={Boolean(user?.wallet)}
              className="truncate text-xs"
              skeletonClassName="h-3 w-20"
            >
              {user?.wallet &&
                shortHex(user.wallet, { prefixLength: 12, suffixLength: 8 })}
            </TextOrSkeleton>
          </div>
          <ChevronDown className="ml-2 size-4" />
        </div>
      </DropdownMenuTrigger>
      {user && (
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-0 shadow-dropdown"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem className="dropdown-menu-item">
              <BringToFront className="mr-2 size-4" />
              <Link href="/admin/activity" prefetch>
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
            <ThemeMenuItem />
            <DropdownMenuItem className="dropdown-menu-item">
              <BookOpenText className="mr-2 size-4" />
              <Link href="https://console.settlemint.com/documentation">
                Documentation
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => void handleSignOut()}
            className="dropdown-menu-item"
          >
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
