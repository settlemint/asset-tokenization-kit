import { PincodeInput } from "@/components/onboarding/pincode-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";

interface PinSetupScreenProps {
  showConfirmPincode: boolean;
  form: UseFormReturn<{
    pincode: string;
    confirmPincode: string;
  }>;
  isPending: boolean;
  onInitialPinSubmit: () => void;
  onSetPincode: () => void;
}

export function PinSetupScreen({
  showConfirmPincode,
  form,
  isPending,
  onInitialPinSubmit,
  onSetPincode,
}: PinSetupScreenProps) {
  const handleInitialPinChange = useCallback(
    (value: string) => {
      form.setValue("pincode", value);
    },
    [form]
  );

  const handleConfirmPinChange = useCallback(
    (value: string) => {
      form.setValue("confirmPincode", value);
    },
    [form]
  );

  const renderInitialPinField = useCallback(
    ({
      field,
    }: {
      field: { value: string; onChange: (value: string) => void };
    }) => (
      <FormItem className="space-y-4">
        <FormControl>
          <div className="flex justify-center">
            <PincodeInput
              value={field.value}
              onChange={handleInitialPinChange}
              autoFocus
              disabled={isPending}
            />
          </div>
        </FormControl>
        <FormMessage className="text-center" />
      </FormItem>
    ),
    [handleInitialPinChange, isPending]
  );

  const renderConfirmPinField = useCallback(
    ({
      field,
    }: {
      field: { value: string; onChange: (value: string) => void };
    }) => (
      <FormItem className="space-y-4">
        <FormControl>
          <div className="flex justify-center">
            <PincodeInput
              value={field.value}
              onChange={handleConfirmPinChange}
              autoFocus
              disabled={isPending}
            />
          </div>
        </FormControl>
        <FormMessage className="text-center" />
      </FormItem>
    ),
    [handleConfirmPinChange, isPending]
  );

  if (showConfirmPincode) {
    return (
      <div className="space-y-6 text-center">
        <Form {...form}>
          <FormField
            control={form.control}
            name="confirmPincode"
            render={renderConfirmPinField}
          />
        </Form>
        {/* Confirm button below PIN confirmation input */}
        <div className="flex justify-center">
          <Button
            onClick={onSetPincode}
            disabled={isPending}
            className="min-w-[120px]"
          >
            {isPending ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Setting PIN code...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <Form {...form}>
        <FormField
          control={form.control}
          name="pincode"
          render={renderInitialPinField}
        />
      </Form>
      {/* Confirm button below PIN input */}
      <div className="flex justify-center">
        <Button
          onClick={onInitialPinSubmit}
          disabled={isPending}
          className="min-w-[120px]"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}
