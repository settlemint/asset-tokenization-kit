import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const OTPInput = ({ value, onChange, className }: Props) => {
  return (
    <InputOTP
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      className={cn('justify-center gap-1.5', className)}
      autoComplete="off"
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} className="h-8 w-8" />
        <InputOTPSlot index={1} className="h-8 w-8" />
        <InputOTPSlot index={2} className="h-8 w-8" />
        <InputOTPSlot index={3} className="h-8 w-8" />
        <InputOTPSlot index={4} className="h-8 w-8" />
        <InputOTPSlot index={5} className="h-8 w-8" />
      </InputOTPGroup>
    </InputOTP>
  );
};
