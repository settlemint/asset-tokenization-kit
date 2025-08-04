import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isAddress } from "viem";

export interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showError?: boolean;
  errorMessage?: string;
}

export function AddressInput({
  value,
  onChange,
  placeholder,
  className,
  showError = true,
  errorMessage = "Please enter a valid Ethereum address",
}: AddressInputProps) {
  // Validate the current value
  const isValid = value === "" || isAddress(value);
  const shouldShowError = showError && !isValid;

  return (
    <div>
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className={cn(
          className,
          shouldShowError && "border-destructive focus-visible:ring-destructive"
        )}
      />
      {shouldShowError && (
        <p className="text-destructive text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
