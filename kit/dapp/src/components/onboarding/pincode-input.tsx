import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";

type PincodeInputProps = Omit<
  Parameters<typeof InputOTP>[0],
  "render" | "minLength" | "maxLength" | "pattern" | "autoComplete" | "required"
>;

/**
 * A 6-digit PIN code input component
 */
export function PincodeInput(props: PincodeInputProps) {
  return (
    <InputOTP
      {...props}
      minLength={6}
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      className={cn("justify-center gap-1.5", props.className)}
      autoComplete="one-time-code"
      data-lpignore="true"
      data-form-type="other"
      data-1p-ignore="true"
      inputMode="numeric"
      required
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} className="size-8" />
        <InputOTPSlot index={1} className="size-8" />
        <InputOTPSlot index={2} className="size-8" />
        <InputOTPSlot index={3} className="size-8" />
        <InputOTPSlot index={4} className="size-8" />
        <InputOTPSlot index={5} className="size-8" />
      </InputOTPGroup>
    </InputOTP>
  );
}
