import { getAddonIcon } from "@/components/system-addons/components/addon-icons";
import type { SystemAddonType } from "@/orpc/routes/system/addon/routes/addon.create.schema";
import { useTranslation } from "react-i18next";

interface AddonCardProps {
  addonType: SystemAddonType;
  children?: React.ReactNode;
}

export function AddonCard({
  addonType,
  children,
}: AddonCardProps): React.ReactElement {
  const { t } = useTranslation("onboarding");
  const Icon = getAddonIcon(addonType);

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border bg-background">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h4 className="text-base font-medium">
              {t(`system-addons.addon-selection.addon-types.${addonType}.title`)}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t(`system-addons.addon-selection.addon-types.${addonType}.description`)}
            </p>
          </div>
        </div>
      </div>
      <div className="ml-4 flex items-start">{children}</div>
    </div>
  );
}