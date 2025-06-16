import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

type SecretCodeInputProps = Omit<
  Parameters<typeof InputOTP>[0],
  "render" | "minLength" | "maxLength" | "pattern" | "autoComplete" | "required"
>;

export function SecretCodeInput(props: SecretCodeInputProps) {
  return (
    <InputOTP
      {...props}
      minLength={10}
      maxLength={10}
      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      className={cn("justify-center gap-1.5", props.className)}
      autoComplete="off"
      pasteTransformer={pasteTransformer}
      required
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} className="size-8" />
        <InputOTPSlot index={1} className="size-8" />
        <InputOTPSlot index={2} className="size-8" />
        <InputOTPSlot index={3} className="size-8" />
        <InputOTPSlot index={4} className="size-8" />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={5} className="size-8" />
        <InputOTPSlot index={6} className="size-8" />
        <InputOTPSlot index={7} className="size-8" />
        <InputOTPSlot index={8} className="size-8" />
        <InputOTPSlot index={9} className="size-8" />
      </InputOTPGroup>
    </InputOTP>
  );
}

function pasteTransformer(text: string) {
  return text.replace(/-/g, "");
}
