'use client';

import { TranslatableFormFieldMessage } from '@/components/blocks/form/form-field-translatable-message';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useTranslations } from 'next-intl';
import type { ComponentPropsWithoutRef } from 'react';
import { useCallback } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { BaseFormInputProps } from './types';

type InputProps = ComponentPropsWithoutRef<typeof InputOTP>;

type FormOtpDialogProps<T extends FieldValues> = Omit<
  InputProps,
  keyof BaseFormInputProps<T> | 'maxLength' | 'pattern'
> &
  BaseFormInputProps<T> & {
    open: boolean;
    onOpenChange: (show: boolean) => void;
    onSubmit: () => void;
  };

export function FormOtpDialog<T extends FieldValues>({
  className,
  open,
  onOpenChange,
  onSubmit,
  disabled,
  ...props
}: FormOtpDialogProps<T>) {
  const handleSubmit = useCallback(() => {
    onSubmit();
    onOpenChange(false);
  }, [onSubmit, onOpenChange]);
  const tPincode = useTranslations('components.form.pincode-dialog');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tPincode('title')}</DialogTitle>
          <DialogDescription>{tPincode('description')}</DialogDescription>
        </DialogHeader>
        <FormField
          {...props}
          render={({ field, formState: { isValid } }) => (
            <FormItem className="flex flex-col space-y-1">
              <div className="space-y-2">
                <FormControl>
                  <InputOTP
                    minLength={6}
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={(field.value ?? '').toString()}
                    onChange={field.onChange}
                    className={cn('justify-center gap-1.5', className)}
                    autoComplete="off"
                    required
                    disabled={disabled}
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
                </FormControl>
                <TranslatableFormFieldMessage className="text-destructive" />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!isValid}>
                  Yes, confirm
                </Button>
              </DialogFooter>
            </FormItem>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
