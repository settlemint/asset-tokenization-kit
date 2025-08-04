import { AddressInput } from "@/components/address/address-input";
import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "@/components/form/field";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
import { type EthereumAddress } from "@/lib/zod/validators/ethereum-address";

export interface AddressInputProps {
  label: string;
  description?: string;
  required?: boolean;
}

export function AddressInputField({
  label,
  description,
  required,
}: AddressInputProps) {
  const field = useFieldContext<EthereumAddress>();

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <AddressInput
        value={field.state.value}
        onChange={field.handleChange}
        className={cn(errorClassNames(field.state.meta))}
      />
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
