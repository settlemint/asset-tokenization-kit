import { ComplianceModulesGrid } from "@/components/compliance/compliance-modules-grid";
import { ComplianceModuleDetail } from "@/components/compliance/details/compliance-module-detail";
import type { ComplianceModulesList } from "@/orpc/routes/system/compliance-module/routes/compliance-module.list.schema";
import type {
  ComplianceModulePairInput,
  ComplianceModulePairInputArray,
  ComplianceTypeId,
} from "@atk/zod/compliance";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type Address, getAddress } from "viem";

interface ComplianceModulesProps {
  allModules: ComplianceModulesList;

  enabledModules: ComplianceModulePairInputArray;

  onEnable: (modulePair: ComplianceModulePairInput) => void;

  onDisable: (modulePair: ComplianceModulePairInput) => void;
  onActiveModuleChange?: (
    activeModule: {
      typeId: ComplianceTypeId;
      module: Address;
    } | null
  ) => void;
}

export function ComplianceModules({
  allModules,
  enabledModules,
  onEnable,
  onDisable,
  onActiveModuleChange,
}: ComplianceModulesProps) {
  const { t } = useTranslation(["compliance-modules", "form"]);
  const [activeModule, setActiveModule] = useState<{
    typeId: ComplianceTypeId;
    module: Address;
  } | null>(null);

  // Show detail view when a module is selected
  if (activeModule) {
    return (
      <ComplianceModuleDetail
        activeModule={activeModule}
        enabledModules={enabledModules}
        onEnable={onEnable}
        onDisable={onDisable}
        onClose={() => {
          setActiveModule(null);
          onActiveModuleChange?.(null);
        }}
      />
    );
  }

  const availableModules = allModules.filter((module) => {
    const isEnabled = enabledModules?.some(
      (enabledModule) => enabledModule.typeId === module.typeId
    );
    return !isEnabled;
  });

  return (
    <div className="space-y-8">
      {/* Enabled modules section */}
      {enabledModules && enabledModules.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {t("compliance-modules:sections.enabled.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("compliance-modules:sections.enabled.description")}
            </p>
          </div>
          <ComplianceModulesGrid
            complianceTypeIds={enabledModules.map((module) => module.typeId)}
            onModuleSelect={(typeId) => {
              const module = enabledModules.find((m) => m.typeId === typeId);
              if (module) {
                setActiveModule({
                  typeId,
                  module: getAddress(module.module),
                });
                onActiveModuleChange?.({
                  typeId,
                  module: getAddress(module.module),
                });
              }
            }}
          />
        </div>
      )}

      {/* Available modules section */}
      {availableModules.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {t("compliance-modules:sections.available.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("compliance-modules:sections.available.description")}
            </p>
          </div>
          <ComplianceModulesGrid
            className="pb-2"
            complianceTypeIds={availableModules.map((module) => module.typeId)}
            onModuleSelect={(typeId) => {
              const module = availableModules.find((m) => m.typeId === typeId);
              if (module) {
                setActiveModule({
                  typeId,
                  module: module.module,
                });
                onActiveModuleChange?.({
                  typeId,
                  module: module.module,
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
