import { complianceModuleConfig } from "@/components/compliance/config";
import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type AddressModuleType = "AddressBlockListComplianceModule";

export function AddressRestrictionModuleDetail({
  typeId,
  module,
  isEnabled,
  initialValues,
  onEnable,
  onDisable,
  onClose,
}: ComplianceModuleDetailProps<AddressModuleType>) {
  const { t } = useTranslation(["compliance-modules", "form"]);

  const config = complianceModuleConfig[typeId];

  // Translation key for address block list
  const moduleKey = "addressBlockList";

  // TODO: Initialize addresses from initialValues when input fields are added
  const [selectedAddresses, _setSelectedAddresses] = useState<string[]>(
    initialValues?.values ?? []
  );

  const handleEnable = () => {
    // TODO: Implement address encoding when input fields are added
    onEnable({
      typeId,
      module,
      values: selectedAddresses,
      params: "", // TODO: Encode address parameters
    });
  };

  const handleDisable = () => {
    onDisable({
      typeId,
      module,
      values: [],
      params: "",
    });
  };

  // TODO: Implement proper change detection when input fields are added
  const isInputChanged =
    selectedAddresses.length !== (initialValues?.values.length ?? 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {t("compliance-modules:title")}
        </Button>
      </div>

      <div className="flex-1">
        <div className="flex flex-col items-start mb-6 space-y-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div>
                <config.icon className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-semibold leading-none tracking-tight">
                {t(`modules.${moduleKey}.title`)}
              </h2>
            </div>
            <div>
              {isEnabled && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDisable();
                    onClose();
                  }}
                >
                  {t("form:buttons.disable")}
                </Button>
              )}
              {!isEnabled && (
                <Button onClick={handleEnable}>
                  {t("form:buttons.enable")}
                </Button>
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t(`modules.${moduleKey}.description`)}
            </p>
          </div>
          {/* TODO: Add address input fields here when ready */}
          {isEnabled && (
            <div className="w-full">
              {/* Placeholder for address input fields */}
              <div className="p-4 border border-dashed border-muted-foreground/30 rounded-md">
                <p className="text-muted-foreground text-sm text-center">
                  Address input fields will be added here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-6">
        <Button variant="outline" onClick={onClose}>
          {t("form:buttons.back")}
        </Button>
        <Button
          disabled={!isEnabled || !isInputChanged}
          onClick={() => {
            handleEnable();
            onClose();
          }}
        >
          {t("form:buttons.save")}
        </Button>
      </div>
    </div>
  );
}
