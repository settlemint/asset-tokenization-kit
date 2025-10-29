import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp";

type PincodeInputProps = Omit<
  Parameters<typeof InputOTP>[0],
  "render" | "minLength" | "maxLength" | "pattern" | "autoComplete" | "required"
> & {
  masked?: boolean;
};

/**
 * A masked PIN slot that shows dots instead of the actual character
 */
function MaskedPinSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        "size-8",
        className
      )}
      {...props}
    >
      {char && <div className="h-2 w-2 rounded-full bg-foreground" />}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

/**
 * A 6-digit PIN code input component with optional masking
 */
export function PincodeInput({ masked = true, ...props }: PincodeInputProps) {
  const SlotComponent = masked ? MaskedPinSlot : InputOTPSlot;

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
        {Array.from({ length: 6 }).map((_, index) => (
          <SlotComponent key={index} index={index} className="size-8" />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
