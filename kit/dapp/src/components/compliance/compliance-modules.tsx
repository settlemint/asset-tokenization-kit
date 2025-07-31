import { ComplianceModulesGrid } from "@/components/compliance/compliance-modules-grid";
import { Button } from "@/components/ui/button";
import { getModuleConfig, isModuleEnabled } from "@/lib/compliance/utils";
import {
  ComplianceTypeIdEnum,
  type ComplianceModulePairInput,
  type ComplianceModulePairInputArray,
  type ComplianceParams,
  type ComplianceTypeId,
} from "@/lib/zod/validators/compliance";
import { ComplianceModulesList } from "@/orpc/routes/system/compliance-module/routes/compliance-module.list.schema";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getAddress, type Address } from "viem";
import { CountryAllowlistModuleDetail } from "./details/country-allowlist-module-detail";

interface ComplianceModulesProps {
  /** Array of configured compliance modules with their current state */
  allModules: ComplianceModulesList;
  /** Array of configured compliance modules with their current state */
  enabledModules: ComplianceModulePairInputArray;
  /** Callback when a compliance module is enabled with encoded parameters */
  onEnable: (modulePair: ComplianceModulePairInput) => void;
  /** Callback when a compliance module is disabled with encoded parameters */
  onDisable: (modulePair: ComplianceModulePairInput) => void;
}

export function ComplianceModules({
  allModules,
  enabledModules,
  onEnable,
  onDisable,
}: ComplianceModulesProps) {
  const { t } = useTranslation(["compliance-modules", "form"]);
  const [activeModule, setActiveModule] = useState<{
    typeId: ComplianceTypeId;
    module: Address;
  } | null>(null);

  // Show detail view when a module is selected
  if (activeModule) {
    const isEnabled = isModuleEnabled(activeModule.typeId, enabledModules);
    const initialValues = isEnabled
      ? getModuleConfig(activeModule.typeId, enabledModules)
      : {
          ...activeModule,
          values: [],
          params: "",
        };

    // Detail component mapping based on compliance module type
    const detailComponents = {
      [ComplianceTypeIdEnum.CountryAllowListComplianceModule]: (
        <CountryAllowlistModuleDetail
          typeId="CountryAllowListComplianceModule"
          module={activeModule.module}
          isEnabled={isEnabled}
          initialValues={
            initialValues as Extract<
              ComplianceParams,
              { typeId: "CountryAllowListComplianceModule" }
            >
          }
          onEnable={onEnable}
          onDisable={onDisable}
          onClose={() => {
            setActiveModule(null);
          }}
        />
      ),
      [ComplianceTypeIdEnum.AddressBlockListComplianceModule]: (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Address Block List</h3>
          <p className="text-muted-foreground mb-4">
            Configuration interface coming soon...
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setActiveModule(null);
            }}
          >
            {t("form:buttons.back")}
          </Button>
        </div>
      ),
      [ComplianceTypeIdEnum.CountryBlockListComplianceModule]: (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Country Block List</h3>
          <p className="text-muted-foreground mb-4">
            Configuration interface coming soon...
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setActiveModule(null);
            }}
          >
            {t("form:buttons.back")}
          </Button>
        </div>
      ),
      [ComplianceTypeIdEnum.IdentityAllowListComplianceModule]: (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Identity Allow List</h3>
          <p className="text-muted-foreground mb-4">
            Configuration interface coming soon...
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setActiveModule(null);
            }}
          >
            {t("form:buttons.back")}
          </Button>
        </div>
      ),
      [ComplianceTypeIdEnum.IdentityBlockListComplianceModule]: (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Identity Block List</h3>
          <p className="text-muted-foreground mb-4">
            Configuration interface coming soon...
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setActiveModule(null);
            }}
          >
            {t("form:buttons.back")}
          </Button>
        </div>
      ),
      [ComplianceTypeIdEnum.SMARTIdentityVerificationComplianceModule]: (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            SMART Identity Verification
          </h3>
          <p className="text-muted-foreground mb-4">
            Configuration interface coming soon...
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setActiveModule(null);
            }}
          >
            {t("form:buttons.back")}
          </Button>
        </div>
      ),
    };

    return (
      detailComponents[activeModule.typeId] || (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Unknown Module Type</h3>
          <p className="text-muted-foreground mb-4">
            {activeModule.typeId} is not supported
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setActiveModule(null);
            }}
          >
            {t("form:buttons.back")}
          </Button>
        </div>
      )
    );
  }

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
              }
            }}
          />
        </div>
      )}

      {/* Available modules section */}
      {allModules && (
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
            complianceTypeIds={allModules.map((module) => module.typeId)}
            onModuleSelect={(typeId) => {
              const module = allModules.find((m) => m.typeId === typeId);
              if (module) {
                setActiveModule({
                  typeId,
                  module: module.id,
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
