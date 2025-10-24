import { complianceModuleConfig } from "@/components/compliance/config";
import {
  SelectableCard,
  SelectableCardContent,
  SelectableCardDescription,
  SelectableCardIcon,
  SelectableCardTitle,
} from "@/components/selectable-card/selectable-card";
import { cn } from "@/lib/utils";
import type { ComplianceTypeId } from "@atk/zod/compliance";
import { useTranslation } from "react-i18next";

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
              if (config.implemented) {
                onModuleSelect(typeId);
              }
            }}
            className={cn(
              !config.implemented && "opacity-50 cursor-not-allowed"
            )}
          >
            <SelectableCardIcon>
              <IconComponent className="w-4 h-4" />
            </SelectableCardIcon>
            <SelectableCardContent>
              <SelectableCardTitle>
                {t(`modules.${typeId}.title`)}
              </SelectableCardTitle>
              <SelectableCardDescription>
                {t(`modules.${typeId}.shortDescription`)}
              </SelectableCardDescription>
            </SelectableCardContent>
          </SelectableCard>
        );
      })}
    </div>
  );
}
