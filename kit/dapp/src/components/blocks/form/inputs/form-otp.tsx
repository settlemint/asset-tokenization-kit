'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import type { ComponentPropsWithoutRef } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { BaseFormInputProps } from './types';

type InputProps = ComponentPropsWithoutRef<typeof InputOTP>;

type FormOtp<T extends FieldValues> = Omit<
  InputProps,
  keyof BaseFormInputProps<T> | 'maxLength' | 'pattern'
> &
  BaseFormInputProps<T>;

export function FormOtp<T extends FieldValues>({
  className,
  label,
  ...props
}: FormOtp<T>) {
  return (
    <FormField
      {...props}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel
              className={cn(
                fieldState.error && 'text-destructive',
                props.disabled && 'cursor-not-allowed opacity-70'
              )}
              htmlFor={field.name}
              id={`${field.name}-label`}
            >
              <span>{label}</span>
              {props.required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={(field.value ?? '').toString()}
              onChange={field.onChange}
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
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
