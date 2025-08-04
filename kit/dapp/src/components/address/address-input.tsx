import { Input } from "@/components/ui/input";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";

export interface AddressInputProps {
  value: EthereumAddress;
  onChange: (value: EthereumAddress) => void;
  placeholder?: string;
  className?: string;
}

export function AddressInput({
  value,
  onChange,
  placeholder,
  className,
}: AddressInputProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => {
        onChange(e.target.value as EthereumAddress);
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}
