import { PincodeInput } from "@/components/onboarding/pincode-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth/auth.client";
import { queryClient } from "@/lib/query.client";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface WalletSecurityStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any; // Use any for now to match the user type from session
  onSuccess?: () => void; // Callback when security step is completed successfully
  onRegisterAction?: (action: () => void) => void; // Register an action for external triggers
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
  onSuccess,
  onRegisterAction,
}: WalletSecurityStepProps) {
  const { sessionKey } = useContext(AuthQueryContext);
  const [isPincodeSet, setIsPincodeSet] = useState(false);
  const [showSuccessButton, setShowSuccessButton] = useState(false);
  const [showEducationalContent, setShowEducationalContent] = useState(true);

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
        // Call the onSuccess callback if provided
        onSuccess?.();
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

  const handleSecurityOptionSelect = useCallback((option: "pin" | "otp") => {
    console.log("Selected security option:", option);
    setShowEducationalContent(false);
    // For now, we'll proceed with PIN setup regardless of selection
    // In the future, you might want to show different forms based on the option
  }, []);

  const handlePinSelect = useCallback(() => {
    handleSecurityOptionSelect("pin");
  }, [handleSecurityOptionSelect]);

  const handleOtpSelect = useCallback(() => {
    handleSecurityOptionSelect("otp");
  }, [handleSecurityOptionSelect]);

  const handleNext = useCallback(() => {
    if (showEducationalContent) {
      // This should be handled by the security option buttons
      return;
    } else if (hasPincode || isPincodeSet) {
      onNext?.();
    } else {
      handleSetPincode();
    }
  }, [
    showEducationalContent,
    hasPincode,
    isPincodeSet,
    onNext,
    handleSetPincode,
  ]);

  // Register the action for external triggers (like step wizard buttons)
  useEffect(() => {
    if (onRegisterAction) {
      onRegisterAction(handleNext);
    }
  }, [onRegisterAction, handleNext]);

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
            : showEducationalContent
              ? "Choose how you want to protect your assets"
              : "Set up a 6-digit PIN code to protect your wallet transactions"}
        </p>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={useMemo(() => ({ minHeight: "450px", maxHeight: "550px" }), [])}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          {/* Show educational content first */}
          {showEducationalContent && !hasPincode && !isPincodeSet && (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-foreground leading-relaxed">
                  Just like your bank card requires a PIN to confirm payments,
                  your wallet also needs protection to authorize actions
                  securely.
                </p>

                <p className="text-sm text-foreground leading-relaxed">
                  Your wallet controls access to your valuable digital assets
                  and identity. To keep it safe, you can secure it with a PIN
                  code or enable one-time passwords (OTP) for added protection.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        PIN code:
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A simple 6 digit code you enter on your device to
                        quickly unlock your wallet. Easy and fast.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        One-Time Password (OTP):
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        A time-based code generated by an authenticator app on
                        your phone. Offers stronger security by requiring a
                        unique code each time you log in.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-foreground leading-relaxed">
                  You can choose one or both options. The more layers you add,
                  the safer your wallet becomes.
                </p>
              </div>
            </div>
          )}

          {/* Show PIN setup form after educational content */}
          {!showEducationalContent && !hasPincode && !isPincodeSet && (
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

              {/* Pincode setup form */}
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
            </div>
          )}

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

          {showEducationalContent && !hasPincode && !isPincodeSet ? (
            // Show security option buttons
            <>
              <Button onClick={handlePinSelect}>PIN Code</Button>
              <Button onClick={handleOtpSelect}>One-Time Password</Button>
            </>
          ) : (
            // Show regular next button
            <Button
              onClick={handleNext}
              disabled={isPending || (isPincodeSet && !showSuccessButton)}
            >
              {isPending || (isPincodeSet && !showSuccessButton) ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                  >
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
          )}
        </div>
      </div>
    </div>
  );
}
