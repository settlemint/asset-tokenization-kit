import { Logo } from "@/components/logo/logo";
import { useTranslation } from "react-i18next";
export function AssetTokenizationKitLogo() {
  const { t } = useTranslation(["general"]);

  return (
    <div className="flex items-center gap-2 !text-md font-semibold text-foreground">
      <div className="size-5">
        <Logo variant="icon" />
      </div>
      <div>{t("general:appName")}</div>
    </div>
  );
}
