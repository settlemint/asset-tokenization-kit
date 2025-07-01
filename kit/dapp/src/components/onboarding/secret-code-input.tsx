import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SecretCodeInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  readOnly?: boolean;
};

/**
 * A secret code input component that can be used for both input and display of secret codes
 */
export function SecretCodeInput({
  value = "",
  onChange,
  autoFocus,
  disabled,
  className,
  readOnly = false,
}: SecretCodeInputProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      autoFocus={autoFocus}
      disabled={disabled}
      readOnly={readOnly}
      className={cn(
        "font-mono text-center text-sm",
        readOnly && "bg-gray-50 dark:bg-gray-900/50 cursor-default",
        className
      )}
      placeholder="Enter secret code"
      maxLength={64}
    />
  );
}
