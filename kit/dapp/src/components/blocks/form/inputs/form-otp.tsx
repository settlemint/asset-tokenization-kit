"use client";

import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-translatable-message";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import type { ComponentPropsWithoutRef } from "react";
import type { FieldValues } from "react-hook-form";
import type { BaseFormInputProps } from "./types";

type InputProps = ComponentPropsWithoutRef<typeof InputOTP>;

type FormOtp<T extends FieldValues> = Omit<
  InputProps,
  keyof BaseFormInputProps<T> | "maxLength" | "pattern"
> &
  BaseFormInputProps<T>;

export function FormOtp<T extends FieldValues>({
  className,
  ...props
}: FormOtp<T>) {
  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-1">
          <FormLabel>{props.label}</FormLabel>
          <FormControl>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={(field.value ?? "").toString()}
              onChange={field.onChange}
              className={cn("justify-center gap-1.5", className)}
              autoComplete="off"
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
          </FormControl>
          <TranslatableFormFieldMessage className="text-destructive" />
        </FormItem>
      )}
    />
  );
}
