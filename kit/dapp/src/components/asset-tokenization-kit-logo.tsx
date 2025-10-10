import { useBranding } from "@/components/branding/branding-context";
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
  const branding = useBranding();

  // Use custom branding if available, otherwise fall back to default
  const title = branding.applicationTitle || t("general:appName");

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-md font-semibold text-foreground",
        className
      )}
    >
      {branding.logoMain ? (
        <img
          src={branding.logoMain}
          alt={title}
          className="h-5 object-contain"
        />
      ) : (
        <>
          <div className="size-5">
            <Logo variant="icon" />
          </div>
          <div>{title}</div>
        </>
      )}
    </div>
  );
}
