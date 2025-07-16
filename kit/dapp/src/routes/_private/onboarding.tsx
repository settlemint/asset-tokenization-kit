import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useLocalStorage, useTimeout } from "usehooks-ts";

export const Route = createFileRoute("/_private/onboarding")({
  component: OnboardingLayout,
});

function OnboardingLayout() {
  const { t } = useTranslation(["onboarding", "general"]);
  const [, setIsReturningUser] = useLocalStorage("isReturningUser", false);

  useTimeout(() => {
    setIsReturningUser(true);
  }, 10 * 1000);

  return (
    <div className="min-h-screen w-full bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
      <div className="absolute top-8 left-8 flex flex-col items-end gap-0">
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
      </div>
      <div className="absolute top-8 right-8 flex gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <div className="rounded-xl shadow-lg overflow-hidden">
            <div
              style={{
                background: "var(--sm-wizard-sidebar-gradient)",
                backgroundSize: "cover",
                backgroundPosition: "top",
                backgroundRepeat: "no-repeat",
              }}
            >
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
