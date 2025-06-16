import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/auth")({
  component: LayoutComponent,
});

function LayoutComponent() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
      <div className="absolute top-8 left-8 flex flex-col items-end gap-0">
        <div className={cn("flex w-full items-center gap-3")}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <Logo variant="icon" forcedColorMode="dark" />
          </div>
          <div className="flex flex-col text-foreground leading-none">
            <span className="font-bold text-lg text-primary-foreground">
              {t("general.appName")}
            </span>
            <span className="-mt-1 overflow-hidden truncate text-ellipsis text-md text-sm leading-snug text-primary-foreground dark:text-foreground ">
              {t("general.appDescription")}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute top-8 right-8 flex gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="flex min-h-screen items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
