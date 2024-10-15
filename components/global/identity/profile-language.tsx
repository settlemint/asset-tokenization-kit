"use client";

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, usePathname } from "@/lib/i18n";
import { availableLanguageTags, languageTag } from "@/paraglide/runtime";
import { getEmoji, getNativeName } from "language-flag-colors";
import { Globe } from "lucide-react";
import React, { useMemo } from "react";

function ProfileLanguageInner() {
  const pathname = usePathname();
  const currentLanguage = languageTag();

  const languageOptions = useMemo(
    () =>
      availableLanguageTags.map((lang) => ({
        lang,
        emoji: getEmoji(lang) ?? "🌐",
        name: getNativeName(lang) ?? lang,
      })),
    [],
  );

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center space-x-2">
        <Globe className="h-4 w-4" />
        <span>Language</span>
        <span className="text-md" aria-hidden="true">
          {getEmoji(currentLanguage) ?? "🌐"}
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {languageOptions.map(({ lang, emoji, name }) => (
            <DropdownMenuItem key={lang}>
              <Link
                href={pathname}
                locale={lang}
                hrefLang={lang}
                className="flex items-center space-x-2"
                aria-label={`Change language to ${name}`}
              >
                <span className="text-lg" aria-hidden="true">
                  {emoji}
                </span>
                <span>{name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

export const ProfileLanguage = React.memo(ProfileLanguageInner);
