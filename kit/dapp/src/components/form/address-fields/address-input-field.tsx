import {
  errorClassNames,
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
} from "@/components/form/field";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
import { type EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { getAddress } from "viem";

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
      <Input
        id={field.name}
        type="text"
        value={field.state.value}
        onChange={(e) => {
          field.handleChange(getAddress(e.target.value));
        }}
        className={cn(errorClassNames(field.state.meta))}
      />
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
