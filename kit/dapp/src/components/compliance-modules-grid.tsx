import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ComplianceTypeId } from "@/lib/zod/validators/compliance";
import {
  BanIcon,
  CheckCircleIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface ComplianceModuleConfig {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descriptionKey: string;
}

const complianceModuleConfig = {
  AddressBlockListComplianceModule: {
    icon: BanIcon,
    titleKey: "modules.addressBlockList.title",
    descriptionKey: "modules.addressBlockList.description",
  },
  CountryAllowListComplianceModule: {
    icon: CheckCircleIcon,
    titleKey: "modules.countryAllowList.title",
    descriptionKey: "modules.countryAllowList.description",
  },
  CountryBlockListComplianceModule: {
    icon: MapPinIcon,
    titleKey: "modules.countryBlockList.title",
    descriptionKey: "modules.countryBlockList.description",
  },
  IdentityAllowListComplianceModule: {
    icon: UserIcon,
    titleKey: "modules.identityAllowList.title",
    descriptionKey: "modules.identityAllowList.description",
  },
  IdentityBlockListComplianceModule: {
    icon: ShieldIcon,
    titleKey: "modules.identityBlockList.title",
    descriptionKey: "modules.identityBlockList.description",
  },
  SMARTIdentityVerificationComplianceModule: {
    icon: ShieldCheckIcon,
    titleKey: "modules.smartIdentityVerification.title",
    descriptionKey: "modules.smartIdentityVerification.description",
  },
} as const satisfies Record<ComplianceTypeId, ComplianceModuleConfig>;

export interface ComplianceModulesGridProps {
  /** Array of compliance module type IDs to display */
  complianceTypeIds: readonly ComplianceTypeId[];
  /** Callback when a compliance module is selected */
  onModuleSelect: (typeId: ComplianceTypeId) => void;
  /** Additional CSS classes for the grid container */
  className?: string;
}

/**
 * A pure presentational component that displays compliance modules in a 3-column grid.
 * Each module is rendered as a card with an icon, title, and description.
 * Similar to how integrations are displayed in Linear settings.
 */
export function ComplianceModulesGrid({
  complianceTypeIds,
  onModuleSelect,
  className,
}: ComplianceModulesGridProps) {
  const { t } = useTranslation("compliance-modules");

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {complianceTypeIds.map((typeId) => {
        const config = complianceModuleConfig[typeId];
        const IconComponent = config.icon;

        return (
          <Card
            key={typeId}
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => {
              onModuleSelect(typeId);
            }}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">
                    {t(config.titleKey)}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {t(config.descriptionKey)}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
