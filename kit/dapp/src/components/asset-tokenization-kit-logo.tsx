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

  // Get size multipliers
  const logoSize = branding.logoSize ? parseFloat(branding.logoSize) : 1.0;
  const titleSize = branding.titleSize ? parseFloat(branding.titleSize) : 1.0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 font-semibold text-foreground",
        className
      )}
      style={{ fontSize: `${titleSize}rem` }}
    >
      {branding.logoMain ? (
        <img
          src={branding.logoMain}
          alt={title}
          className="object-contain"
          style={{ height: `${logoSize * 1.25}rem` }}
        />
      ) : (
        <>
          <div
            className="object-contain"
            style={{
              width: `${logoSize * 1.25}rem`,
              height: `${logoSize * 1.25}rem`,
            }}
          >
            <Logo variant="icon" />
          </div>
          <div>{title}</div>
        </>
      )}
    </div>
  );
}
