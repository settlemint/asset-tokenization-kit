"use client";

import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { LanguageMenuItem } from "@/components/blocks/language/language-menu-item";
import { ThemeMenuItem } from "@/components/blocks/theme/theme-menu-item";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";
import type { User } from "@/lib/queries/user/user-schema";
import { cn } from "@/lib/utils";
import { shortHex } from "@/lib/utils/hex";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { Address } from "viem";
import { CurrencyMenuItem } from "../blocks/currency/currency-menu-item";
import {
  BookTextIcon,
  type BookTextIconHandle,
} from "../ui/animated-icons/book-text";
import { LogoutIcon, type LogoutIconHandle } from "../ui/animated-icons/logout";
import type { SquareStackIconHandle } from "../ui/animated-icons/square-stack";

// Custom text component that renders either content or a skeleton with consistent DOM structure
function TextOrSkeleton({
  condition,
  children,
  className,
  skeletonClassName,
}: {
  condition: boolean;
  children: ReactNode;
  className?: string;
  skeletonClassName?: string;
}) {
  return (
    <span className={className}>
      {condition ? (
        children
      ) : (
        <span className={cn("block", skeletonClassName)}>
          <Skeleton className="h-full w-full" />
        </span>
      )}
    </span>
  );
}

export function UserDropdown({ user }: { user: User }) {
  const { error, isPending, refetch } = authClient.useSession();

  const router = useRouter();
  const t = useTranslations("layout.user-dropdown");

  // Create refs for each icon
  const stackIconRef = useRef<SquareStackIconHandle>(null);
  const bookIconRef = useRef<BookTextIconHandle>(null);
  const logoutIconRef = useRef<LogoutIconHandle>(null);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/"); // redirect to login page
        },
      },
    });
  }, [router]);

  useEffect(() => {
    if (isPending && !user?.id) {
      refetch();
    }
  }, [isPending, refetch, user?.id]);

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="border-destructive text-destructive"
      >
        <AlertTitle>{error.message}</AlertTitle>
      </Alert>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex h-12 cursor-pointer items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Suspense fallback={<Skeleton className="size-8 rounded-lg" />}>
            {user ? (
              <AddressAvatar
                address={user.wallet as Address}
                email={user.email}
                className="size-8 rounded-lg"
                indicator={false}
              />
            ) : (
              <Skeleton className="size-8 rounded-lg" />
            )}
          </Suspense>
          <div className="grid flex-1 text-left rtl:text-right text-sm leading-tight">
            <TextOrSkeleton
              condition={Boolean(user?.name || user?.email)}
              className="truncate font-semibold"
              skeletonClassName="size-44"
            >
              {user?.name ?? user?.email}
            </TextOrSkeleton>

            <TextOrSkeleton
              condition={Boolean(user?.wallet)}
              className="truncate text-xs"
              skeletonClassName="size-30"
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
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded shadow-dropdown"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <ThemeMenuItem />
            <LanguageMenuItem />
            <CurrencyMenuItem user={user} />
            <DropdownMenuItem
              onMouseEnter={() => bookIconRef.current?.startAnimation()}
              onMouseLeave={() => bookIconRef.current?.stopAnimation()}
            >
              <BookTextIcon ref={bookIconRef} className="mr-2 size-4" />
              <Link href="https://console.settlemint.com/documentation/">
                {t("documentation")}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => void handleSignOut()}
            onMouseEnter={() => logoutIconRef.current?.startAnimation()}
            onMouseLeave={() => logoutIconRef.current?.stopAnimation()}
          >
            <LogoutIcon ref={logoutIconRef} className="mr-2 size-4" />
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
