"use client";

import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-field-translatable-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCallback } from "react";
import type { FieldValues } from "react-hook-form";
import type { BaseFormInputProps } from "./types";

type InputProps = ComponentPropsWithoutRef<typeof InputOTP>;

type FormOtpDialogProps<T extends FieldValues> = Omit<
  InputProps,
  keyof BaseFormInputProps<T> | "maxLength" | "pattern"
> &
  BaseFormInputProps<T> & {
    showSecurityConfirmation: boolean;
    setShowSecurityConfirmation: (show: boolean) => void;
    onSubmit: () => void;
  };

export function FormOtpDialog<T extends FieldValues>({
  className,
  showSecurityConfirmation,
  setShowSecurityConfirmation,
  onSubmit,
  ...props
}: FormOtpDialogProps<T>) {
  const handleSubmit = useCallback(() => {
    onSubmit();
    setShowSecurityConfirmation(false);
  }, [onSubmit, setShowSecurityConfirmation]);

  return (
    <Dialog
      open={showSecurityConfirmation}
      onOpenChange={setShowSecurityConfirmation}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Some title</DialogTitle>
          <DialogDescription>Some description</DialogDescription>
        </DialogHeader>
        <FormField
          {...props}
          render={({ field, formState: { isValid } }) => (
            <FormItem className="flex flex-col space-y-1">
              <div className="space-y-2">
                <FormLabel>{props.label}</FormLabel>
                <FormControl>
                  <InputOTP
                    minLength={6}
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
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSecurityConfirmation(false)}
                >
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
