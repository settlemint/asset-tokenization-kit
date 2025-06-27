import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';

type PincodeInputProps = Omit<
  Parameters<typeof InputOTP>[0],
  'render' | 'minLength' | 'maxLength' | 'pattern' | 'autoComplete' | 'required'
>;

export function PincodeInput(props: PincodeInputProps) {
  return (
    <InputOTP
      {...props}
      autoComplete="off"
      className={cn('justify-center gap-1.5', props.className)}
      maxLength={6}
      minLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      required
    >
      <InputOTPGroup>
        <InputOTPSlot className="size-8" index={0} />
        <InputOTPSlot className="size-8" index={1} />
        <InputOTPSlot className="size-8" index={2} />
        <InputOTPSlot className="size-8" index={3} />
        <InputOTPSlot className="size-8" index={4} />
        <InputOTPSlot className="size-8" index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}
