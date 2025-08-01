import { BaseAddressField } from "./base-address-field";

interface UserAddressFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function UserAddressField({
  label,
  description,
  required = false,
  placeholder,
  disabled = false,
}: UserAddressFieldProps) {
  return (
    <BaseAddressField
      label={label}
      description={description}
      required={required}
      placeholder={placeholder || "Select or enter user address"}
      disabled={disabled}
      mode="user"
      recentStorageKey="recently-selected-user-addresses"
      addressTypeName="user"
    />
  );
}
