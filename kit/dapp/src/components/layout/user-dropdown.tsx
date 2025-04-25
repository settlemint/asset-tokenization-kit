"use client";

import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { LanguageMenuItem } from "@/components/blocks/language/language-menu-item";
import { ThemeMenuItem } from "@/components/blocks/theme/theme-menu-item";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  UsersIcon,
  type UsersIconHandle,
} from "@/components/ui/animated-icons/users";
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
import { cn } from "@/lib/utils";
import { shortHex } from "@/lib/utils/hex";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";
import {
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { CurrencyMenuItem } from "../blocks/currency/currency-menu-item";
import {
  BookTextIcon,
  type BookTextIconHandle,
} from "../ui/animated-icons/book-text";
import { LogoutIcon, type LogoutIconHandle } from "../ui/animated-icons/logout";

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

export function UserDropdown() {
  const { data, error, isPending, refetch } = authClient.useSession();
  const posthog = usePostHog();

  const router = useRouter();
  const t = useTranslations("layout.user-dropdown");

  // Create refs for each icon
  const bookIconRef = useRef<BookTextIconHandle>(null);
  const logoutIconRef = useRef<LogoutIconHandle>(null);
  const usersIconRef = useRef<UsersIconHandle>(null);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.reset();
          }
          router.push("/"); // redirect to login page
        },
      },
    });
  }, [router, posthog]);

  useEffect(() => {
    if (isPending && !data?.user?.id) {
      refetch();
    }
  }, [isPending, refetch, data?.user?.id]);

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
            {data?.user ? (
              <AddressAvatar
                address={data.user.wallet}
                email={data.user.email}
                className="size-8 rounded-lg"
                indicator={false}
              />
            ) : (
              <Skeleton className="size-8 rounded-lg" />
            )}
          </Suspense>
          <div className="grid flex-1 text-left rtl:text-right text-sm leading-tight">
            <TextOrSkeleton
              condition={Boolean(data?.user?.name || data?.user?.email)}
              className="truncate font-semibold"
              skeletonClassName="size-44"
            >
              {data?.user?.name ?? data?.user?.email}
            </TextOrSkeleton>

            <TextOrSkeleton
              condition={Boolean(data?.user?.wallet)}
              className="truncate text-xs"
              skeletonClassName="size-30"
            >
              {data?.user?.wallet &&
                shortHex(data?.user?.wallet, {
                  prefixLength: 12,
                  suffixLength: 8,
                })}
            </TextOrSkeleton>
          </div>
          <ChevronDown className="ml-2 size-4" />
        </div>
      </DropdownMenuTrigger>
      {data?.user && (
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded shadow-dropdown"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              onMouseEnter={() => usersIconRef.current?.startAnimation()}
              onMouseLeave={() => usersIconRef.current?.stopAnimation()}
            >
              <UsersIcon ref={usersIconRef} className="mr-2 size-4" />
              <Link href="/portfolio/settings/profile">{t("profile")}</Link>
            </DropdownMenuItem>
            <ThemeMenuItem />
            <LanguageMenuItem />
            <CurrencyMenuItem />
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
