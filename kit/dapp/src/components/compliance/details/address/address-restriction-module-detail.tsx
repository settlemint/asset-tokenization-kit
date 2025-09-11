import { AddressInput } from "@/components/address/address-input";
import { AddressSelect } from "@/components/address/address-select";
import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { complianceModuleConfig } from "@/components/compliance/config";
import {
  ComplianceDetailActions,
  ComplianceDetailBreadcrumb,
  ComplianceDetailCard,
  ComplianceDetailContent,
  ComplianceDetailDescription,
  ComplianceDetailFooter,
  ComplianceDetailForm,
  ComplianceDetailHeader,
  ComplianceDetailSection,
  ComplianceDetailTitle,
} from "@/components/compliance/details/compliance-detail-card";
import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";
import { ArrayFieldsLayout } from "@/components/layout/array-fields-layout";
import { Button } from "@/components/ui/button";
import { encodeAddressParams } from "@/lib/compliance/encoding/encode-address-params";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAddress } from "viem";

type AddressModuleType =
  | "AddressBlockListComplianceModule"
  | "IdentityAllowListComplianceModule"
  | "IdentityBlockListComplianceModule";

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

  // Initialize addresses from initialValues
  type Entry = { id: string; value: string };
  const makeId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? (crypto.randomUUID())
      : Math.random().toString(36).slice(2);

  const [selectedAddresses, setSelectedAddresses] = useState<Entry[]>(
    (initialValues?.values ?? []).map((v) => ({ id: makeId(), value: v }))
  );

  // Helper function to update a specific address by index
  const updateAddress = (index: number, newAddress: string) => {
    setSelectedAddresses((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, value: newAddress } : entry
      )
    );
  };

  // Add new empty address
  const handleAddAddress = () => {
    setSelectedAddresses((prev) => [...prev, { id: makeId(), value: "" }]);
  };

  // Remove address by index
  const handleRemoveAddress = (_: Entry, index: number) => {
    setSelectedAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEnable = () => {
    // Filter out empty addresses and only include valid Ethereum addresses
    const validAddresses = selectedAddresses
      .map((e) => e.value)
      .filter((addr) => isAddress(addr));

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
  const isInputChanged = useMemo(() => {
    const initial = (initialValues?.values ?? []).map((a) => a.toLowerCase());
    const current = selectedAddresses
      .map((e) => e.value)
      .filter((addr) => isAddress(addr))
      .map((a) => a.toLowerCase());

    // Convert to Sets to remove duplicates, then to sorted arrays for comparison
    const initialUnique = [...new Set(initial)].toSorted();
    const currentUnique = [...new Set(current)].toSorted();

    return (
      initialUnique.length !== currentUnique.length ||
      JSON.stringify(initialUnique) !== JSON.stringify(currentUnique)
    );
  }, [initialValues?.values, selectedAddresses]);

  const hasInvalidAddresses = selectedAddresses.some(
    (e) => !isAddress(e.value)
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
            action={
              <ComplianceDetailActions
                isEnabled={isEnabled}
                onEnable={handleEnable}
                onDisable={handleDisable}
                onClose={onClose}
              />
            }
          >
            {t(`modules.${typeId}.title`)}
          </ComplianceDetailTitle>

          <ComplianceDetailDescription>
            {t(`modules.${typeId}.description`)}
          </ComplianceDetailDescription>

          {isEnabled && (
            <ComplianceDetailForm>
              <ArrayFieldsLayout
                values={selectedAddresses}
                rowKey={(e) => e.id}
                onAdd={handleAddAddress}
                onRemove={handleRemoveAddress}
                component={(entry, index) => (
                  <AddressSelectOrInputToggle>
                    {({ mode }) => (
                      <>
                        {mode === "select" && (
                          <AddressSelect
                            value={
                              entry.value && isAddress(entry.value)
                                ? entry.value
                                : undefined
                            }
                            onChange={(newAddress) => {
                              updateAddress(index, newAddress);
                            }}
                            scope="user"
                            placeholder="Select an address to block"
                          />
                        )}
                        {mode === "manual" && (
                          <AddressInput
                            value={entry.value}
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
                addButtonLabel={t("form:address.addAddress")}
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
          disabled={!isEnabled || hasInvalidAddresses || !isInputChanged}
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
