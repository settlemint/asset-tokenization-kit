import { PincodeInput } from "@/components/onboarding/pincode-input";
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
import { useCallback, useContext, useEffect, useState } from "react";
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

export function WalletSecurityStep({
  onSuccess,
  onRegisterAction,
}: WalletSecurityStepProps) {
  const { data: session } = authClient.useSession();
  const { sessionKey } = useContext(AuthQueryContext);
  const [isPincodeSet, setIsPincodeSet] = useState(false);

  const user = session?.user;
  const hasPincode = !!user?.pincodeEnabled;

  const form = useForm<PincodeFormValues>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
    },
  });

  const { mutate: enablePincode, isPending } = useMutation({
    mutationFn: (data: PincodeFormValues) =>
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
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to set PIN code");
    },
  });

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

  // Register the action with parent
  useEffect(() => {
    if (onRegisterAction) {
      if (!hasPincode && !isPincodeSet) {
        onRegisterAction(handleSetPincode);
      } else {
        // Unregister by passing a no-op function when pincode is set
        onRegisterAction(() => {
          // No action needed when pincode is already set
        });
      }
    }
  }, [onRegisterAction, hasPincode, isPincodeSet, handleSetPincode]);

  return (
    <div className="h-full flex flex-col">
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
        style={{ minHeight: "450px", maxHeight: "550px" }}
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
                    render={({ field }) => (
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
                    )}
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
