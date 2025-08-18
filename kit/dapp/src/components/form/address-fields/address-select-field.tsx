import { AddressSelect } from "@/components/address/address-select";
import {
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "@/components/form/field";
import { useFieldContext } from "@/hooks/use-form-contexts";
import type { AddressSearchScope } from "@/hooks/use-search-addresses";
import type { EthereumAddress } from "@atk/zod/validators/ethereum-address";

interface AddressSelectProps {
  label: string;
  scope: AddressSearchScope;
  description?: string;
  required?: boolean;
}

export function AddressSelectField({
  label,
  description,
  scope,
  required = false,
}: AddressSelectProps) {
  const field = useFieldContext<EthereumAddress>();

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <AddressSelect
        value={field.state.value}
        onChange={field.handleChange}
        scope={scope}
      />
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
