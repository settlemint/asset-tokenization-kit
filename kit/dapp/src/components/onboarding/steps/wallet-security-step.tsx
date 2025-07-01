import { PincodeInput } from "@/components/onboarding/pincode-input";
import { RecoveryCodesDisplay } from "@/components/onboarding/recovery-codes-display";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth.client";
import { queryClient } from "@/lib/query.client";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const pincodeSchema = z.object({
  pincode: z.string().length(6, "PIN code must be exactly 6 digits"),
});

type PincodeFormValues = z.infer<typeof pincodeSchema>;

interface WalletSecurityStepProps {
  onSuccess?: () => void;
  onRegisterAction?: (action: () => void) => void;
}

/**
 * Step component for setting up wallet PIN code security during onboarding
 * @param {object} props - Component props
 * @param {() => void} [props.onSuccess] - Callback when PIN code is successfully set
 * @param {(action: () => void) => void} [props.onRegisterAction] - Callback to register the PIN setup action with parent
 * @returns {JSX.Element} The wallet security setup step component
 */
export function WalletSecurityStep({
  onSuccess,
  onRegisterAction,
}: WalletSecurityStepProps) {
  const { data: session } = authClient.useSession();
  const { sessionKey } = useContext(AuthQueryContext);
  const [isPincodeSet, setIsPincodeSet] = useState(false);
  const [secretCodes, setSecretCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodesGenerated, setRecoveryCodesGenerated] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [userPassword, setUserPassword] = useState("");
  const [autoGenerationAttempted, setAutoGenerationAttempted] = useState(false);

  const user = session?.user;
  const hasPincode = !!user?.pincodeEnabled;

  const form = useForm<PincodeFormValues>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
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
      // Complete onboarding since recovery codes are already saved
      if (recoveryCodesGenerated) {
        toast.success("🎉 Wallet security setup complete!");
        onSuccess?.();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to set PIN code");
    },
  });

  const { mutate: generateSecretCodes, isPending: isGeneratingCodes } =
    useMutation({
      mutationFn: async (password?: string) => {
        // Check if user has wallet before attempting generation
        if (!user?.wallet) {
          throw new Error(
            "Wallet is required to generate recovery codes. Please complete wallet setup first."
          );
        }

        // Direct fetch call to bypass client generation issues
        const response = await fetch("/api/auth/secret-codes/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include session cookies
          body: JSON.stringify({
            // Include password if provided
            ...(password && { password }),
          }),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Unknown error" }));

          // If password is required, show password prompt
          if (errorData.code === "PASSWORD_IS_REQUIRED" && !password) {
            setShowPasswordPrompt(true);
            throw new Error(
              "Please enter your password to generate recovery codes"
            );
          }

          throw new Error(
            errorData.message ||
              `Failed to generate secret codes: ${response.status}`
          );
        }

        const data = await response.json();
        return { data };
      },
      onSuccess: (response) => {
        setShowPasswordPrompt(false);
        setUserPassword("");
        if (response.data?.secretCodes) {
          setSecretCodes(response.data.secretCodes);
          setShowRecoveryCodes(true);
          toast.success("Recovery codes generated successfully");
        } else {
          toast.error("No recovery codes received - please try again");
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to generate recovery codes");
      },
    });

  // Auto-generate secret codes for first-time users (before PIN code setup)
  useEffect(() => {
    if (
      user?.wallet &&
      !user?.pincodeEnabled &&
      !user?.initialOnboardingFinished &&
      !isGeneratingCodes &&
      secretCodes.length === 0 &&
      !showRecoveryCodes &&
      !autoGenerationAttempted
    ) {
      setAutoGenerationAttempted(true);
      generateSecretCodes(undefined); // No password needed for first-time users
    }
  }, [
    user?.wallet,
    user?.pincodeEnabled,
    user?.initialOnboardingFinished,
    isGeneratingCodes,
    secretCodes.length,
    showRecoveryCodes,
    autoGenerationAttempted,
  ]);

  const handleSetPincode = useCallback(() => {
    if (!isPending && !hasPincode) {
      const values = form.getValues();
      if (values.pincode.length === 6) {
        enablePincode(values);
      } else {
        void form.trigger("pincode");
      }
    }
  }, [isPending, hasPincode, form, enablePincode]);

  const handleRecoveryCodesAcknowledged = useCallback(() => {
    setRecoveryCodesGenerated(true);
    setShowRecoveryCodes(false);
    // Don't call onSuccess yet - we still need to set up PIN code
    toast.success(
      "Great! Now let's set up your PIN code for transaction security."
    );
  }, []);

  // Register the action with parent
  useEffect(() => {
    if (onRegisterAction) {
      if (!hasPincode && !isPincodeSet) {
        onRegisterAction(handleSetPincode);
      } else if (showRecoveryCodes && !recoveryCodesGenerated) {
        // Register the acknowledge action when recovery codes are shown
        onRegisterAction(handleRecoveryCodesAcknowledged);
      } else {
        // Unregister by passing a no-op function when everything is complete
        onRegisterAction(() => {
          // No action needed when everything is complete
        });
      }
    }
  }, [
    onRegisterAction,
    hasPincode,
    isPincodeSet,
    showRecoveryCodes,
    recoveryCodesGenerated,
    handleSetPincode,
    handleRecoveryCodesAcknowledged,
  ]);

  const renderPincodeField = useCallback(
    ({
      field,
    }: {
      field: { value: string; onChange: (value: string) => void };
    }) => {
      return (
        <FormItem className="flex flex-col items-center space-y-4">
          <FormLabel className="text-base font-medium">
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
          <FormMessage />
        </FormItem>
      );
    },
    [isPending]
  );

  // Show recovery codes view (prioritize this over PIN setup for better UX)
  if (showRecoveryCodes && secretCodes.length > 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Save Your Recovery Codes</h2>
          <p className="text-sm text-muted-foreground pt-2">
            First, let's secure your wallet with recovery codes. Please save
            these codes in a secure location before setting up your PIN.
          </p>
        </div>
        <div
          className="flex-1 overflow-y-auto"
          style={useMemo(
            () => ({ minHeight: "450px", maxHeight: "550px" }),
            []
          )}
        >
          <div className="max-w-3xl space-y-6 pr-2">
            <RecoveryCodesDisplay
              codes={secretCodes}
              onDownload={() => {
                toast.success("Remember to store these codes securely!");
              }}
            />

            {/* Continue button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleRecoveryCodesAcknowledged}
                className="px-8"
              >
                I've Saved My Recovery Codes - Continue to PIN Setup
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {hasPincode || isPincodeSet
            ? "Wallet Security Complete"
            : recoveryCodesGenerated
              ? "Set Up PIN Code"
              : "Secure Your Wallet"}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {hasPincode || isPincodeSet
            ? "Your wallet is fully secured with recovery codes and PIN protection"
            : recoveryCodesGenerated
              ? "Final step: Set up a 6-digit PIN code to protect your wallet transactions"
              : "Setting up wallet security with recovery codes and PIN protection"}
        </p>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={useMemo(() => ({ minHeight: "450px", maxHeight: "550px" }), [])}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          {hasPincode || isPincodeSet ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
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
                  <span className="font-medium text-green-800 dark:text-green-300">
                    PIN Code Configured Successfully
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your wallet is now protected with PIN code verification
                </p>
              </div>

              {/* Show loading state for recovery codes generation */}
              {isGeneratingCodes && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="font-medium text-blue-800 dark:text-blue-300">
                      Generating Recovery Codes...
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    Please wait while we generate your backup recovery codes.
                  </p>
                </div>
              )}

              {/* Manual trigger for recovery codes if automatic generation fails */}
              {!isGeneratingCodes && !showRecoveryCodes && (
                <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <svg
                      className="h-5 w-5 text-orange-600 dark:text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium text-orange-800 dark:text-orange-300">
                      Generate Recovery Codes
                    </span>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    {user?.wallet
                      ? "Now let's generate your recovery codes for wallet backup."
                      : "Please complete wallet setup before generating recovery codes."}
                  </p>

                  {showPasswordPrompt && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Enter your password to generate recovery codes:
                      </label>
                      <Input
                        type="password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoFocus
                      />
                    </div>
                  )}

                  <Button
                    onClick={() =>
                      generateSecretCodes(
                        showPasswordPrompt ? userPassword : undefined
                      )
                    }
                    disabled={
                      isGeneratingCodes ||
                      !user?.wallet ||
                      (showPasswordPrompt && !userPassword)
                    }
                    className="w-full"
                  >
                    {showPasswordPrompt
                      ? "Generate with Password"
                      : user?.wallet
                        ? "Generate Recovery Codes"
                        : "Wallet Required"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
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
                      {recoveryCodesGenerated
                        ? "Complete Your Security Setup"
                        : "Why set up wallet security?"}
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {recoveryCodesGenerated
                        ? "Great! You've saved your recovery codes. Now set up a PIN code for quick and secure access to your wallet transactions."
                        : "We'll first generate recovery codes for account recovery, then set up a PIN code for transaction security."}
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

                  {/* Security features */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1 1 21 9z"
                        />
                      </svg>
                      <span>Easy to Remember</span>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
