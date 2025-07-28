import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface DialogLayoutProps {
  children?: ReactNode;
}

/**
 *
 */
export function DialogLayout({ children }: DialogLayoutProps) {
  const { t } = useTranslation(["general"]);

  return (
    <div className="DialogLayout flex flex-col min-h-screen bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')] bg-no-repeat bg-cover">
      <div className="flex-shrink-0 flex justify-between items-center p-8">
        <div className="flex w-full items-center gap-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <Logo variant="icon" forcedColorMode="dark" />
          </div>
          <div className="flex flex-col text-foreground leading-none">
            <span className="font-bold text-lg text-primary-foreground">
              {t("general:appName")}
            </span>
            <span className="-mt-1 overflow-hidden truncate text-ellipsis text-md text-sm leading-snug text-primary-foreground dark:text-foreground">
              {t("general:appDescription")}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="DialogLayout__card flex flex-col justify-center items-center flex-1 overflow-hidden">
        <div className="h-[85vh] w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 max-w-[1600px] my-8">
          {children}
        </div>
      </div>
    </div>
  );
}
