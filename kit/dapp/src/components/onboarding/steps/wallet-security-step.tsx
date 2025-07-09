import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { StepComponentProps } from "@/components/multistep-form/types";
import { authClient } from "@/lib/auth/auth.client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query.client";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PincodeInput } from "@/components/onboarding/pincode-input";
import { toast } from "sonner";
import { z } from "zod";

interface WalletSecurityStepProps extends StepComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any; // Use any for now to match the user type from session
}

const pincodeSchema = z
  .object({
    pincode: z.string().length(6, "PIN code must be exactly 6 digits"),
    confirmPincode: z.string().length(6, "PIN code must be exactly 6 digits"),
  })
  .refine((data) => data.pincode === data.confirmPincode, {
    message: "PIN codes don't match",
    path: ["confirmPincode"],
  });

type PincodeFormValues = z.infer<typeof pincodeSchema>;

export function WalletSecurityStep({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  user,
}: WalletSecurityStepProps) {
  const { sessionKey } = useContext(AuthQueryContext);
  const [isPincodeSet, setIsPincodeSet] = useState(false);
  const [showSuccessButton, setShowSuccessButton] = useState(false);

  const hasPincode = Boolean(user?.pincodeEnabled);

  const form = useForm<PincodeFormValues>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
      confirmPincode: "",
    },
  });

  const { mutate: enablePincode, isPending } = useMutation({
    mutationFn: async (data: PincodeFormValues) =>
      authClient.pincode.enable({
        pincode: data.pincode,
        // Password is not required during initial onboarding
      }),
    onSuccess: () => {
      toast.success("PIN code set successfully");
      void queryClient.invalidateQueries({
        queryKey: sessionKey,
      });
      setIsPincodeSet(true);
      // After 1 second, show the success button text
      setTimeout(() => {
        setShowSuccessButton(true);
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to set PIN code");
    },
  });

  // Watch for changes in confirm PIN to handle real-time validation
  const watchConfirmPincode = form.watch("confirmPincode");
  const watchPincode = form.watch("pincode");

  useEffect(() => {
    // Only check if both fields have 6 digits
    if (watchPincode.length === 6 && watchConfirmPincode.length === 6) {
      if (watchPincode !== watchConfirmPincode) {
        // Clear confirm field and refocus after a short delay
        setTimeout(() => {
          form.setValue("confirmPincode", "");
          const confirmInput = document.querySelector(
            '[name="confirmPincode"] input'
          );
          if (confirmInput) {
            (confirmInput as HTMLInputElement).focus();
          }
        }, 500); // Give user time to see the mismatch
      }
    }
  }, [watchPincode, watchConfirmPincode, form]);

  const handleSetPincode = useCallback(() => {
    if (!isPending && !hasPincode) {
      const values = form.getValues();
      if (values.pincode.length === 6 && values.confirmPincode.length === 6) {
        // Trigger validation to check if PINs match
        void form.trigger().then((isValid) => {
          if (isValid) {
            enablePincode(values);
          } else {
            // PINs don't match - clear confirm field and refocus
            form.setValue("confirmPincode", "");
            // Focus will be handled by the PincodeInput component
            setTimeout(() => {
              const confirmInput = document.querySelector(
                '[name="confirmPincode"] input'
              );
              if (confirmInput) {
                (confirmInput as HTMLInputElement).focus();
              }
            }, 100);
          }
        });
      } else {
        void form.trigger();
      }
    }
  }, [isPending, hasPincode, form, enablePincode]);

  const handleNext = useCallback(() => {
    if (hasPincode || isPincodeSet) {
      onNext();
    } else {
      handleSetPincode();
    }
  }, [hasPincode, isPincodeSet, onNext, handleSetPincode]);

  const renderPincodeField = useCallback(
    ({
      field,
    }: {
      field: { value: string; onChange: (value: string) => void };
    }) => {
      return (
        <FormItem className="space-y-2 pt-8">
          <div className="grid grid-cols-[auto,auto] gap-4 justify-center items-center">
            <FormLabel className="text-base font-medium whitespace-nowrap text-right">
              Enter a 6-digit PIN code
            </FormLabel>
            <FormControl>
              <PincodeInput
                value={field.value}
                onChange={field.onChange}
                autoFocus
                disabled={isPending}
              />
            </FormControl>
          </div>
          <FormMessage className="text-center" />
        </FormItem>
      );
    },
    [isPending]
  );

  const renderConfirmPincodeField = useCallback(
    ({
      field,
    }: {
      field: { value: string; onChange: (value: string) => void };
    }) => {
      return (
        <FormItem className="space-y-2 pt-4">
          <div className="grid grid-cols-[auto,auto] gap-4 justify-center items-center">
            <FormLabel className="text-base font-medium whitespace-nowrap text-right">
              Confirm your PIN code
            </FormLabel>
            <FormControl>
              <PincodeInput
                value={field.value}
                onChange={field.onChange}
                disabled={isPending}
              />
            </FormControl>
          </div>
          <FormMessage className="text-center" />
        </FormItem>
      );
    },
    [isPending]
  );

  return (
    <div className="h-full flex flex-col">
      <style>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {hasPincode || isPincodeSet ? "Wallet Secured" : "Secure Your Wallet"}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {hasPincode || isPincodeSet
            ? "PIN code protection is enabled for your wallet"
            : "Set up a 6-digit PIN code to protect your wallet transactions"}
        </p>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={useMemo(() => ({ minHeight: "450px", maxHeight: "550px" }), [])}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          <div className="space-y-4">
            {/* Info box */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Why set up a PIN code?
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    A PIN code adds an extra layer of security to your wallet,
                    protecting your assets and transactions from unauthorized
                    access.
                  </p>
                </div>
              </div>
            </div>

            {/* Security features */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Transaction Protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Account Security</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Quick Access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                <span>Easy to Remember</span>
              </div>
            </div>

            {/* Success message when PIN is set */}
            {(hasPincode || isPincodeSet) && (
              <div className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                          className="animate-[draw_0.8s_ease-out_forwards]"
                          style={{
                            strokeDasharray: "20",
                            strokeDashoffset: "20",
                          }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-center">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                    PIN Code Configured Successfully
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your wallet is now protected with PIN code verification
                  </p>
                </div>
              </div>
            )}

            {/* Pincode setup form - only show when PIN not set */}
            {!hasPincode && !isPincodeSet && (
              <Form {...form}>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={renderPincodeField}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPincode"
                    render={renderConfirmPincodeField}
                  />
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-end gap-3">
          {!isFirstStep && (
            <Button variant="outline" onClick={onPrevious} disabled={isPending}>
              Previous
            </Button>
          )}
          <Button onClick={handleNext} disabled={isPending || (isPincodeSet && !showSuccessButton)}>
            {isPending || (isPincodeSet && !showSuccessButton) ? (
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
            ) : isLastStep ? (
              "Complete"
            ) : showSuccessButton || hasPincode ? (
              "Generate Your Recovery Codes"
            ) : (
              "Set PIN Code"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
