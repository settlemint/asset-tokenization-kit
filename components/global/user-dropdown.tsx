"use client";

import { signOutAction } from "@/app/auth/signout/actions/sign-out";
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
import { LogOut, MoonIcon, SunIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import type { PropsWithChildren } from "react";
import { startTransition, useCallback } from "react";
import { type GravatarOptions, getGravatarUrl } from "react-awesome-gravatar";

export function UserDropdown({ children }: PropsWithChildren) {
  /**
   * Avatar
   */
  const session = useSession();
  const defaultAvatarOptions: GravatarOptions = {
    default: "identicon",
    size: 200,
  };
  const avatarUrl = getGravatarUrl(session.data?.user.email ?? "", defaultAvatarOptions);

  /**
   * Language
   */
  const pathname = usePathname();
  const currentLanguage = languageTag();

  /**
   * Theme
   */
  const { setTheme, theme, resolvedTheme } = useTheme();
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

  /**
   * Sign out
   */
  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOutAction({});
      } catch (e) {
        console.error(e);
      }
    });
  };

  /**
   * Render
   */
  return (
    <div className="SecureHeader__UserDropdown fixed right-8 top-[9px]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src={avatarUrl} />
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          <div className="flex flex-col items-center justify-center p-4">
            <Avatar className="">
              <AvatarImage src={avatarUrl} />
            </Avatar>
            <div className="pt-4 font-bold">{session.data?.user.email}</div>
            <div className="mt-1 text-xs">{session.data?.user.wallet}</div>
          </div>

          <DropdownMenuSeparator />
          {children}
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                {resolvedTheme === "light" ? (
                  <SunIcon className="h-[1.2rem] w-[1.2rem] mr-2 rotate-0 scale-100 transition-all text-yellow-500 dark:text-yellow-500" />
                ) : (
                  <MoonIcon className="h-[1.2rem] w-[1.2rem] mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                )}
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {themeOptions.map(({ value, label }) => (
                    <DropdownMenuItem key={value} onClick={() => handleSetTheme(value)} className="cursor-pointer">
                      {label === "Light" && (
                        <>
                          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-yellow-500 dark:text-yellow-500" />{" "}
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
              <DropdownMenuSubTrigger className="cursor-pointer">
                <span className="text-lg mr-2" aria-hidden="true">
                  {getEmoji(currentLanguage)}
                </span>
                <span>Language</span>
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

          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span className="ml-2">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
