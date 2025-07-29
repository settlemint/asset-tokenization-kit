import { Logo } from "@/components/logo/logo";
import { useTranslation } from "react-i18next";
export function AssetTokenizationKitLogo() {
  const { t } = useTranslation(["general"]);

  return (
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
  );
}
