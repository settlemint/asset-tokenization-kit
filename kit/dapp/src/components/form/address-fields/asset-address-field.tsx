import { BaseAddressField } from "./base-address-field";

interface AssetAddressFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function AssetAddressField({
  label,
  description,
  required = false,
  placeholder,
  disabled = false,
}: AssetAddressFieldProps) {
  return (
    <BaseAddressField
      label={label}
      description={description}
      required={required}
      placeholder={placeholder || "Select or enter asset address"}
      disabled={disabled}
      scope="asset"
      recentStorageKey="recently-selected-asset-addresses"
      addressTypeName="asset"
    />
  );
}
