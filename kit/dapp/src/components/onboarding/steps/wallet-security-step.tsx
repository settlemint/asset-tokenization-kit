import { PincodeInput } from "@/components/onboarding/pincode-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
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
  
  const hasPincode = Boolean(user?.pincodeEnabled);
  const hasTwoFactor = Boolean(user?.twoFactorEnabled);
  const hasAnySecurityMethod = hasPincode || hasTwoFactor;
  
  // Initialize state based on existing security methods
  const [isPincodeSet, setIsPincodeSet] = useState(false);
  const [showSuccessButton, setShowSuccessButton] = useState(false);
  const [showConfirmPincode, setShowConfirmPincode] = useState(false);
  const [selectedSecurityMethod, setSelectedSecurityMethod] = useState<'pin' | 'otp' | null>(null);
  const [otpUri, setOtpUri] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpEnabled, setIsOtpEnabled] = useState(false);
  
  // Track which security methods are selected for setup (toggle state)
  const [isPinSelected, setIsPinSelected] = useState(false);
  const [isOtpSelected, setIsOtpSelected] = useState(false);

  // Show educational content when not actively setting up a specific method
  // This allows users to toggle and choose what to set up
  const shouldShowEducationalContent = selectedSecurityMethod === null;
  
  // Only show success when user has completed setup in this current session
  const shouldShowSuccess = isPincodeSet || isOtpEnabled;


  const form = useForm<PincodeFormValues>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
      confirmPincode: "",
    },
  });

  // Reset temporary state when component mounts or when navigating back
  // This ensures clean state for new selections and initializes toggle states
  useEffect(() => {
    setSelectedSecurityMethod(null);
    setIsPincodeSet(false);
    setIsOtpEnabled(false);
    setShowConfirmPincode(false);
    setOtpUri(null);
    setOtpCode("");
    setShowSuccessButton(false);
    // Initialize toggle states based on current backend state
    setIsPinSelected(hasPincode);
    setIsOtpSelected(hasTwoFactor);
    form.reset();
  }, [form, hasPincode, hasTwoFactor]); // Include backend state dependencies

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
      
      // Check if user has other methods selected to set up
      if (isOtpSelected && !hasTwoFactor) {
        // Return to educational content to set up OTP next
        setSelectedSecurityMethod(null);
        setShowConfirmPincode(false);
        form.reset();
        toast.info("Now set up your One-Time Password");
      } else {
        // Show success screen after 1 second
        setTimeout(() => {
          setShowSuccessButton(true);
          onSuccess?.();
        }, 1000);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to set PIN code");
    },
  });

  const { mutate: enableTwoFactor, isPending: isEnablingTwoFactor } = useMutation({
    mutationFn: async () => {
      console.log('enableTwoFactor called');
      return authClient.twoFactor.enable({
        // Password is not required during initial onboarding
      });
    },
    onSuccess: (data) => {
      console.log('enableTwoFactor success:', data);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (data && typeof data === 'object' && 'totpURI' in data) {
        setOtpUri(data.totpURI as string);
        toast.success("OTP setup initiated");
      } else {
        console.log('Invalid data format:', data);
        toast.error("Failed to generate QR code");
      }
    },
    onError: (error: Error) => {
      console.log('enableTwoFactor error:', error);
      toast.error(error.message || "Failed to setup OTP");
    },
  });

  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useMutation({
    mutationFn: async (code: string) =>
      authClient.twoFactor.verifyTotp({
        code,
      }),
    onSuccess: () => {
      toast.success("OTP verified successfully");
      void queryClient.invalidateQueries({
        queryKey: sessionKey,
      });
      setIsOtpEnabled(true);
      
      // Check if user has other methods selected to set up
      if (isPinSelected && !hasPincode) {
        // Return to educational content to set up PIN next
        setSelectedSecurityMethod(null);
        setOtpUri(null);
        setOtpCode("");
        toast.info("Now set up your PIN code");
      } else {
        // Show success screen after 1 second
        setTimeout(() => {
          setShowSuccessButton(true);
          onSuccess?.();
        }, 1000);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify OTP");
    },
  });

  // Auto-start OTP setup when the OTP screen is first shown
  useEffect(() => {
    if (selectedSecurityMethod === 'otp' && !otpUri && !isEnablingTwoFactor) {
      console.log('Auto-starting OTP setup');
      enableTwoFactor();
    }
  }, [selectedSecurityMethod]); // Only depend on selectedSecurityMethod to avoid infinite loop

  // Debug logging
  console.log('WalletSecurityStep render:', {
    selectedSecurityMethod,
    shouldShowEducationalContent,
    shouldShowSuccess,
    otpUri,
    isEnablingTwoFactor,
    isPinSelected,
    isOtpSelected,
    hasPincode,
    hasTwoFactor
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

  const handlePinToggle = useCallback(() => {
    const newPinState = !isPinSelected;
    setIsPinSelected(newPinState);
    
    // Only change selection state, don't navigate to setup
    // If toggling off and PIN setup is in progress, clear it
    if (!newPinState && selectedSecurityMethod === "pin") {
      setSelectedSecurityMethod(null);
      setShowConfirmPincode(false);
      form.reset();
    }
  }, [isPinSelected, selectedSecurityMethod, form]);

  const handleOtpToggle = useCallback(() => {
    const newOtpState = !isOtpSelected;
    setIsOtpSelected(newOtpState);
    
    // Only change selection state, don't navigate to setup
    // If toggling off and OTP setup is in progress, clear it
    if (!newOtpState && selectedSecurityMethod === "otp") {
      setSelectedSecurityMethod(null);
      setOtpUri(null);
      setOtpCode("");
    }
  }, [isOtpSelected, selectedSecurityMethod]);

  const handleInitialPinSubmit = useCallback(() => {
    const pincode = form.getValues("pincode");
    if (pincode.length === 6) {
      setShowConfirmPincode(true);
      // Clear confirm field for new entry
      form.setValue("confirmPincode", "");
    } else {
      void form.trigger("pincode");
    }
  }, [form]);

  const handleOtpVerification = useCallback(() => {
    if (otpCode.length === 6) {
      verifyOtp(otpCode);
    }
  }, [otpCode, verifyOtp]);

  const handleBackToSecurityOptions = useCallback(() => {
    setSelectedSecurityMethod(null);
    setShowConfirmPincode(false);
    setOtpUri(null);
    setOtpCode("");
    form.reset();
  }, [form]);

  const handleSetupSecurity = useCallback(() => {
    console.log('handleSetupSecurity called', {
      isPinSelected,
      hasPincode,
      isOtpSelected,
      hasTwoFactor
    });
    
    // Start setup for the first selected method that isn't already set up
    if (isPinSelected && !hasPincode) {
      console.log('Setting up PIN');
      setSelectedSecurityMethod("pin");
    } else if (isOtpSelected && !hasTwoFactor) {
      console.log('Setting up OTP');
      setSelectedSecurityMethod("otp");
      // enableTwoFactor will be called automatically by useEffect
    }
  }, [isPinSelected, hasPincode, isOtpSelected, hasTwoFactor]);

  const handleInitialPinChange = useCallback((value: string) => {
    form.setValue("pincode", value);
  }, [form]);

  const handleConfirmPinChange = useCallback((value: string) => {
    form.setValue("confirmPincode", value);
  }, [form]);

  const renderInitialPinField = useCallback(({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
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
  ), [handleInitialPinChange, isPending]);

  const renderConfirmPinField = useCallback(({ field }: { field: { value: string; onChange: (value: string) => void } }) => (
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
  ), [handleConfirmPinChange, isPending]);

  const handleNext = useCallback(() => {
    if (shouldShowEducationalContent) {
      // This should be handled by the security option buttons
      return;
    } else if (shouldShowSuccess) {
      onNext?.();
    }
    // Remove PIN entry logic from here as it's now handled by individual Confirm buttons
  }, [
    shouldShowEducationalContent,
    shouldShowSuccess,
    onNext,
  ]);


  // Register the action for external triggers (like step wizard buttons)
  useEffect(() => {
    if (onRegisterAction) {
      onRegisterAction(handleNext);
    }
  }, [onRegisterAction, handleNext]);


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
          {shouldShowSuccess
            ? "Wallet Secured"
            : "Secure Your Wallet"}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {shouldShowSuccess
            ? isPincodeSet
              ? "PIN code protection is enabled for your wallet"
              : isOtpEnabled
                ? "Two-factor authentication is enabled for your wallet"
                : "Security setup completed"
            : shouldShowEducationalContent
              ? hasAnySecurityMethod
                ? "Add additional security or continue to the next step"
                : "Choose how you want to protect your assets"
              : "Set up security for your wallet"}
        </p>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={useMemo(() => ({ minHeight: "450px", maxHeight: "550px" }), [])}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          {/* Horizontal 3-step stepper for PIN/OTP flow */}
          {!shouldShowEducationalContent && !shouldShowSuccess && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                {/* Step 1: Create PIN */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white z-10">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                {/* Line between steps */}
                <div className="w-16 h-0.5 bg-gray-300 -mx-px"></div>

                {/* Step 2: Confirm PIN / Setup OTP */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 z-10 transition-all duration-300 ${
                  (showConfirmPincode || (selectedSecurityMethod === 'otp' && otpUri)) 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    (showConfirmPincode || (selectedSecurityMethod === 'otp' && otpUri)) ? 'bg-white' : 'bg-gray-300'
                  }`}></div>
                </div>

                {/* Line between steps */}
                <div className="w-16 h-0.5 bg-gray-300 -mx-px"></div>

                {/* Step 3: Recovery Codes */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 bg-white text-gray-400 z-10">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
              </div>
            </div>
          )}

          {/* PIN/OTP entry section title and description */}
          {!shouldShowEducationalContent && !shouldShowSuccess && (
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {selectedSecurityMethod === 'otp' 
                  ? "Set up an Authenticator app"
                  : showConfirmPincode 
                    ? "Confirm Pincode" 
                    : "Enter a PIN code"}
              </h3>
              <div className="text-sm text-muted-foreground">
                {selectedSecurityMethod === 'otp' ? (
                  <p>Scan the QR code below using your preferred app (like Google Authenticator or Authy). Once scanned, the app will generate time-based codes. These codes are required to verify your wallet transactions and keep your account secure.</p>
                ) : showConfirmPincode ? (
                  <p>Re-enter your PIN to confirm it. This ensures your PIN is set correctly and matches the one you entered earlier</p>
                ) : (
                  <>
                    <p>Create a secure 6 digit PIN for your wallet.</p>
                    <p>This PIN will be required whenever you authorize transactions.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Show educational content first */}
          {shouldShowEducationalContent && (
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

                {/* Security method toggle buttons */}
                <div className="flex gap-4 mt-6">
                  {/* PIN Code Toggle */}
                  <div 
                    className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isPinSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={handlePinToggle}
                  >
                    <div>
                      <h4 className="font-medium text-foreground">
                        PIN Code
                        {hasPincode && <span className="ml-2 text-xs text-green-600">(Already set)</span>}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Quick 6-digit unlock
                      </p>
                    </div>
                  </div>

                  {/* OTP Toggle */}
                  <div 
                    className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isOtpSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={handleOtpToggle}
                  >
                    <div>
                      <h4 className="font-medium text-foreground">
                        One-Time Password (OTP)
                        {hasTwoFactor && <span className="ml-2 text-xs text-green-600">(Already set)</span>}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Time-based authenticator codes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show OTP setup screen */}
          {!shouldShowEducationalContent && !shouldShowSuccess && selectedSecurityMethod === 'otp' && (
            <div className="space-y-6 text-center">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                  {otpUri ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpUri)}`}
                      alt="QR Code for OTP Setup"
                      className="w-36 h-36"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="mx-auto h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24">
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
                        <p className="mt-2 text-sm text-muted-foreground">
                          {isEnablingTwoFactor ? "Setting up authenticator..." : "Generating QR code..."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification section */}
              <div className="space-y-4">
                <h4 className="text-base font-semibold">Verify the code from the app</h4>
                
                <div className="flex justify-center">
                  <InputOTP
                    value={otpCode}
                    onChange={setOtpCode}
                    maxLength={6}
                    disabled={isVerifyingOtp || isEnablingTwoFactor || !otpUri}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Confirm button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleOtpVerification}
                    disabled={isVerifyingOtp || isEnablingTwoFactor || otpCode.length !== 6 || !otpUri}
                    className="min-w-[120px]"
                  >
                    {isVerifyingOtp ? (
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
                        Verifying...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Show initial PIN entry screen */}
          {!shouldShowEducationalContent && !shouldShowSuccess && selectedSecurityMethod === 'pin' && !showConfirmPincode && (
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
                  onClick={handleInitialPinSubmit}
                  disabled={isPending}
                  className="min-w-[120px]"
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}

          {/* Show PIN confirmation screen */}
          {!shouldShowEducationalContent && !shouldShowSuccess && selectedSecurityMethod === 'pin' && showConfirmPincode && (
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
                  onClick={handleSetPincode}
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
          )}

          {/* Success message when PIN or OTP is set */}
          {shouldShowSuccess && (
            <div className="space-y-6">
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

              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Great! Your security method is set.
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    One more step to fully secure your wallet.
                  </p>
                </div>

                <div className="space-y-4 text-sm text-foreground">
                  <p>
                    You've successfully set up your {isOtpEnabled ? 'one-time password' : 'PIN code'}. This adds an important layer of protection to your wallet and keeps your assets safer from unauthorized access.
                  </p>
                  
                  <p>
                    To complete your wallet security, the final step is to generate backup codes. These are secret recovery keys that allow you to regain access if you ever lose your {isOtpEnabled ? 'authentication method' : 'PIN'} or authentication method.
                  </p>
                  
                  <p className="font-medium">
                    Make sure to save these backup codes somewhere safe and private — they are your last line of defense.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-end gap-3">
          {!isFirstStep && (
            <Button 
              variant="outline" 
              onClick={
                // If in setup mode, go back to security options instead of previous wizard step
                !shouldShowEducationalContent && !shouldShowSuccess 
                  ? handleBackToSecurityOptions 
                  : onPrevious
              } 
              disabled={isPending}
            >
              Previous
            </Button>
          )}

          {shouldShowEducationalContent ? (
            // Show continue/setup button based on selections
            <>
              {(isPinSelected && !hasPincode) || (isOtpSelected && !hasTwoFactor) ? (
                <Button onClick={handleSetupSecurity}>
                  Set Up Security
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Continue
                </Button>
              )}
            </>
          ) : (
            // Show regular next button
            <Button
              onClick={handleNext}
              disabled={isPending || isVerifyingOtp || (shouldShowSuccess && !showSuccessButton)}
            >
              {isPending || isVerifyingOtp || (shouldShowSuccess && !showSuccessButton) ? (
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
              ) : shouldShowSuccess ? (
                "Generate Your Recovery Codes"
              ) : (
                "Generate your backup codes"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
