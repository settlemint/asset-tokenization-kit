import { Logo } from "@/components/logo/logo";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface AssetTokenizationKitLogoProps {
  className?: string;
}

export function AssetTokenizationKitLogo({
  className,
}: AssetTokenizationKitLogoProps) {
  const { t } = useTranslation(["general"]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-md font-semibold text-foreground",
        className
      )}
    >
      <div className="size-5">
        <Logo variant="icon" />
      </div>
      <div>{t("general:appName")}</div>
    </div>
  );
}
