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
import {
  SelectableCard,
  SelectableCardIcon,
  SelectableCardContent,
  SelectableCardTitle,
  SelectableCardDescription,
} from "@/components/selectable-card";

interface ComplianceModuleConfig {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descriptionKey: string;
}

const complianceModuleConfig = {
  AddressBlockListComplianceModule: {
    icon: BanIcon,
    titleKey: "modules.addressBlockList.title",
    descriptionKey: "modules.addressBlockList.shortDescription",
  },
  CountryAllowListComplianceModule: {
    icon: CheckCircleIcon,
    titleKey: "modules.countryAllowList.title",
    descriptionKey: "modules.countryAllowList.shortDescription",
  },
  CountryBlockListComplianceModule: {
    icon: MapPinIcon,
    titleKey: "modules.countryBlockList.title",
    descriptionKey: "modules.countryBlockList.shortDescription",
  },
  IdentityAllowListComplianceModule: {
    icon: UserIcon,
    titleKey: "modules.identityAllowList.title",
    descriptionKey: "modules.identityAllowList.shortDescription",
  },
  IdentityBlockListComplianceModule: {
    icon: ShieldIcon,
    titleKey: "modules.identityBlockList.title",
    descriptionKey: "modules.identityBlockList.shortDescription",
  },
  SMARTIdentityVerificationComplianceModule: {
    icon: ShieldCheckIcon,
    titleKey: "modules.smartIdentityVerification.title",
    descriptionKey: "modules.smartIdentityVerification.shortDescription",
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
          <SelectableCard
            key={typeId}
            onClick={() => {
              onModuleSelect(typeId);
            }}
          >
            <SelectableCardIcon>
              <IconComponent className="w-4 h-4" />
            </SelectableCardIcon>
            <SelectableCardContent>
              <SelectableCardTitle>{t(config.titleKey)}</SelectableCardTitle>
              <SelectableCardDescription>
                {t(config.descriptionKey)}
              </SelectableCardDescription>
            </SelectableCardContent>
          </SelectableCard>
        );
      })}
    </div>
  );
}
