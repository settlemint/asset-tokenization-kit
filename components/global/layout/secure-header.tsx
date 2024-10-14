"use client";

import { signOutAction } from "@/app/auth/signout/actions/sign-out";
import Breadcrumbs from "@/components/global/breadcrumb/breadcrumbs";
import type { BreadcrumbItemType } from "@/components/global/breadcrumb/ellipsis-dropdown";
import type { NavItemType } from "@/components/global/navigation/navigation-item";
import { MobileNavigation } from "@/components/global/navigation/navigation-mobile";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, usePathname } from "@/lib/i18n";
import { availableLanguageTags, languageTag } from "@/paraglide/runtime";
import { getEmoji, getNativeName } from "language-flag-colors";
import { Globe, LogOut, MoonIcon, SunIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { startTransition, useCallback } from "react";

interface SecureHeaderProps {
  breadcrumbItems: BreadcrumbItemType[];
  navItems?: Record<string, NavItemType[]>;
}

export function SecureHeader({ breadcrumbItems, navItems = { main: [], footer: [] } }: SecureHeaderProps) {
  const pathname = usePathname();
  const currentLanguage = languageTag();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const session = useSession();
  console.log("session", session);

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ] as const;

  const handleSetTheme = useCallback(
    (newTheme: string) => {
      console.log("newTheme", newTheme);
      setTheme(newTheme);
    },
    [setTheme],
  );

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOutAction({});
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <header className="SecureHeader relative flex h-14 items-center gap-4 px-4 lg:h-[60px] lg:px-6">
      <MobileNavigation navItems={navItems} />
      <Breadcrumbs items={breadcrumbItems} />
      <div className="SecureHeader__UserDropdown fixed right-8 top-[9px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <div className="flex flex-col items-center justify-center p-4">
              <Avatar className="cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" />
              </Avatar>
              <div className="pt-4 font-bold">{session.data?.user.email}</div>
              <div className="mt-1 text-xs">{session.data?.user.wallet}</div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Theme</span>
                  <span className="text-md ml-3" aria-hidden="true">
                    {resolvedTheme === "light" && (
                      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    )}
                    {resolvedTheme === "dark" && (
                      <MoonIcon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    )}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {themeOptions.map(({ value, label }) => (
                      <DropdownMenuItem key={value} onClick={() => handleSetTheme(value)}>
                        {label === "Light" && (
                          <>
                            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-gray-950 dark:text-yellow-500" />{" "}
                            <span className="ml-3">{label}</span>
                          </>
                        )}
                        {label === "Dark" && (
                          <>
                            <MoonIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all  text-gray-950 dark:text-gray-300" />
                            <span className="ml-3">{label}</span>
                          </>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>Language</span>
                  <span className="text-md ml-3" aria-hidden="true">
                    {getEmoji(currentLanguage)}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {availableLanguageTags.map((lang) => (
                      <DropdownMenuItem key={lang}>
                        <Link href={pathname} locale={lang} hrefLang={lang} className="flex items-center">
                          <span className="mr-2 text-lg" aria-hidden="true">
                            {getEmoji(lang)}
                          </span>
                          {getNativeName(lang)}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
