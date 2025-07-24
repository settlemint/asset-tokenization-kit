import { complianceModuleConfig } from "@/components/compliance/config";
import { CountryMultiselect } from "@/components/country/country-multiselect";
import { Button } from "@/components/ui/button";
import { ComplianceTypeIdEnum } from "@/lib/zod/validators/compliance";
import { ArrowLeftIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CountryAllowlistModuleDetailProps {
  onBack: () => void;
  onEnable: () => void;
}

export function CountryAllowlistModuleDetail({
  onBack,
  onEnable,
}: CountryAllowlistModuleDetailProps) {
  const { t } = useTranslation("compliance-modules");
  const config =
    complianceModuleConfig[
      ComplianceTypeIdEnum.CountryAllowListComplianceModule
    ];

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Compliance modules
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Module header with icon and title */}
        <div className="flex flex-col items-start mb-6 space-y-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div>
              <config.icon className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              {t("modules.countryAllowList.title")}
            </h2>
          </div>
          <div>
            <p className="text-muted-foreground text-base leading-relaxed">
              {t("modules.countryAllowList.description")}
            </p>
          </div>
          <CountryMultiselect />
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="flex items-center justify-end gap-3 pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onEnable}>Enable</Button>
      </div>
    </div>
  );
}
