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
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, usePathname } from "@/lib/i18n";
import { availableLanguageTags, languageTag } from "@/paraglide/runtime";
import { getEmoji, getNativeName } from "language-flag-colors";
import { CreditCard, Globe, Keyboard, LogOut, Settings } from "lucide-react";
import { startTransition } from "react";

interface SecureHeaderProps {
  breadcrumbItems: BreadcrumbItemType[];
  navItems?: Record<string, NavItemType[]>;
}

export function SecureHeader({ breadcrumbItems, navItems = { main: [], footer: [] } }: SecureHeaderProps) {
  const pathname = usePathname();
  const currentLanguage = languageTag();
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
    <header className="SecureHeader flex h-14 items-center gap-4 px-4 lg:h-[60px] lg:px-6">
      <MobileNavigation navItems={navItems} />
      <Breadcrumbs items={breadcrumbItems} />
      <div className="fixed right-20 top-[9px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />

                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Keyboard className="mr-2 h-4 w-4" />
                <span>Keyboard shortcuts</span>
                <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
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
