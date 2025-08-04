import { AddressInput } from "@/components/address/address-input";
import { AddressSelect } from "@/components/address/address-select";
import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { complianceModuleConfig } from "@/components/compliance/config";
import {
  ComplianceDetailCard,
  ComplianceDetailHeader,
  ComplianceDetailBreadcrumb,
  ComplianceDetailContent,
  ComplianceDetailSection,
  ComplianceDetailTitle,
  ComplianceDetailDescription,
  ComplianceDetailForm,
  ComplianceDetailFooter,
} from "@/components/compliance/details/compliance-detail-card";
import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";
import { ArrayFieldsLayout } from "@/components/layout/array-fields-layout";
import { Button } from "@/components/ui/button";
import { encodeAddressParams } from "@/lib/compliance/encoding/encode-address-params";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
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

  // Initialize addresses from initialValues
  const [selectedAddresses, setSelectedAddresses] = useState<EthereumAddress[]>(
    (initialValues?.values as EthereumAddress[]) ?? []
  );

  // Helper function to update a specific address by index
  const updateAddress = (index: number, newAddress: EthereumAddress) => {
    setSelectedAddresses((prev) =>
      prev.map((addr, i) => (i === index ? newAddress : addr))
    );
  };

  // Add new empty address
  const handleAddAddress = () => {
    setSelectedAddresses((prev) => [...prev, "" as EthereumAddress]);
  };

  // Remove address by index
  const handleRemoveAddress = (_: EthereumAddress, index: number) => {
    setSelectedAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEnable = () => {
    // Filter out empty addresses and encode the valid ones
    const validAddresses = selectedAddresses.filter(
      (addr) => addr && addr.trim() !== ""
    );
    const encodedParams = encodeAddressParams(validAddresses);

    onEnable({
      typeId,
      module,
      values: validAddresses,
      params: encodedParams,
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

  // Check if addresses have changed from initial values
  const isInputChanged = (() => {
    const initialAddresses = (initialValues?.values as EthereumAddress[]) ?? [];
    if (selectedAddresses.length !== initialAddresses.length) return true;
    return selectedAddresses.some(
      (addr, index) => addr !== initialAddresses[index]
    );
  })();

  // Enable/Disable action buttons
  const actionButtons = (
    <>
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
        <Button onClick={handleEnable}>{t("form:buttons.enable")}</Button>
      )}
    </>
  );

  return (
    <ComplianceDetailCard>
      <ComplianceDetailHeader>
        <ComplianceDetailBreadcrumb onClose={onClose}>
          {t("compliance-modules:title")}
        </ComplianceDetailBreadcrumb>
      </ComplianceDetailHeader>

      <ComplianceDetailContent>
        <ComplianceDetailSection>
          <ComplianceDetailTitle
            icon={<config.icon className="w-5 h-5" />}
            action={actionButtons}
          >
            {t(`modules.${moduleKey}.title`)}
          </ComplianceDetailTitle>

          <ComplianceDetailDescription>
            {t(`modules.${moduleKey}.description`)}
          </ComplianceDetailDescription>

          {isEnabled && (
            <ComplianceDetailForm>
              <ArrayFieldsLayout
                values={selectedAddresses}
                onAdd={handleAddAddress}
                onRemove={handleRemoveAddress}
                component={(address, index) => (
                  <AddressSelectOrInputToggle>
                    {({ mode }) => (
                      <>
                        {mode === "select" && (
                          <AddressSelect
                            value={address || undefined}
                            onChange={(newAddress) => {
                              updateAddress(index, newAddress);
                            }}
                            scope="user"
                            placeholder="Select an address to block"
                          />
                        )}
                        {mode === "manual" && (
                          <AddressInput
                            value={address}
                            onChange={(newAddress) => {
                              updateAddress(index, newAddress);
                            }}
                            placeholder="Enter address to block"
                          />
                        )}
                      </>
                    )}
                  </AddressSelectOrInputToggle>
                )}
                addButtonLabel="Add Address"
              />
            </ComplianceDetailForm>
          )}
        </ComplianceDetailSection>
      </ComplianceDetailContent>

      <ComplianceDetailFooter>
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
      </ComplianceDetailFooter>
    </ComplianceDetailCard>
  );
}
