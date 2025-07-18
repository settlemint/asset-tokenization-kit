import { PincodeInput } from "@/components/form/inputs/pincode-input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { pincode } from "@/lib/zod/validators/pincode";
import { orpc } from "@/orpc/orpc-client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

const logger = createLogger({ level: "debug" });

interface PinSetupComponentProps {
  onSuccess: () => void;
  onBack: () => void;
}

// Create a schema for the form with cross-field validation
const pinFormSchema = z
  .object({
    pincode: pincode(),
    confirmPincode: pincode(),
  })
  .refine((data) => data.pincode === data.confirmPincode, {
    message: "PIN codes don't match",
    path: ["confirmPincode"],
  });

export function PinSetupComponent({
  onSuccess,
  onBack,
}: PinSetupComponentProps) {
  const queryClient = useQueryClient();

  const { mutateAsync: enablePincode, isPending } = useMutation({
    mutationFn: async (pincode: string) =>
      authClient.pincode.enable({
        pincode,
      }),
    onSuccess: async () => {
      // Clear auth session cache to ensure UI reflects updated auth state
      await authClient.getSession({
        query: {
          disableCookieCache: true,
        },
      });

      toast.success("PIN code set successfully");

      // Invalidate user queries to get fresh data
      await queryClient.invalidateQueries({
        queryKey: orpc.user.me.key(),
      });

      onSuccess();
    },
    onError: (error: Error) => {
      logger.error("enablePincode error:", error);
      toast.error(error.message || "Failed to set PIN code");
    },
  });

  const form = useForm({
    defaultValues: {
      pincode: "",
      confirmPincode: "",
    },
    validators: {
      // Immediate field-level validation for better UX
      onChange: ({ value }) => {
        // Validate individual fields first
        const fieldErrors: { pincode?: string; confirmPincode?: string } = {};

        // Validate pincode field
        if (value.pincode) {
          const pincodeResult = pincode().safeParse(value.pincode);
          if (!pincodeResult.success) {
            fieldErrors.pincode =
              pincodeResult.error.issues[0]?.message || "Invalid PIN code";
          }
        }

        // Validate confirmPincode field
        if (value.confirmPincode) {
          const confirmPincodeResult = pincode().safeParse(
            value.confirmPincode
          );
          if (!confirmPincodeResult.success) {
            fieldErrors.confirmPincode =
              confirmPincodeResult.error.issues[0]?.message ||
              "Invalid PIN code";
          }
        }

        // Only validate matching if both fields are valid and have values
        if (
          value.pincode &&
          value.confirmPincode &&
          !fieldErrors.pincode &&
          !fieldErrors.confirmPincode
        ) {
          const result = pinFormSchema.safeParse(value);
          if (!result.success) {
            // Find the error for confirmPincode field
            const confirmPincodeError = result.error.issues.find(
              (issue) => issue.path[0] === "confirmPincode"
            );

            if (confirmPincodeError) {
              fieldErrors.confirmPincode = confirmPincodeError.message;
            }
          }
        }

        return Object.keys(fieldErrors).length > 0
          ? { fields: fieldErrors }
          : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        logger.debug("Submitting PIN code...", value);
        const result = await enablePincode(value.pincode);
        logger.debug("PIN code submitted successfully", result);
      } catch (error) {
        logger.error("Failed to submit PIN code:", error);
      }
    },
  });

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Set up PIN Code</h3>
        <p className="text-sm text-muted-foreground">
          Create a 6-digit PIN code to secure your wallet transactions
        </p>
      </div>

      <div>
        <form.Subscribe>
          {(state) => {
            const showConfirmField = state.values.pincode.length === 6;
            const pinsMatch =
              state.values.pincode === state.values.confirmPincode;
            const bothPinsComplete =
              state.values.pincode.length === 6 &&
              state.values.confirmPincode.length === 6;

            // Check for field-specific errors only when the confirm field is shown
            const hasFieldErrors = showConfirmField
              ? state.fieldMeta.confirmPincode?.errors?.length > 0 || false
              : false;

            const isFormValid =
              bothPinsComplete && pinsMatch && !hasFieldErrors;

            return (
              <div className="space-y-6">
                <form.Field name="pincode">
                  {(field) => (
                    <div className="space-y-4">
                      <div className="text-center">
                        <label className="text-sm font-medium">
                          Enter PIN Code
                        </label>
                      </div>
                      <div className="flex justify-center">
                        <PincodeInput
                          value={field.state.value}
                          onChange={(value) => {
                            field.handleChange(value);
                          }}
                          disabled={isPending}
                          aria-invalid={field.state.meta.errors.length > 0}
                          aria-describedby={
                            field.state.meta.errors.length > 0
                              ? "pincode-error"
                              : undefined
                          }
                        />
                      </div>
                      {field.state.meta.errors.length > 0 && (
                        <p
                          id="pincode-error"
                          className="text-sm text-destructive text-center"
                        >
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {showConfirmField && (
                  <form.Field name="confirmPincode">
                    {(field) => (
                      <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                        <div className="text-center">
                          <label className="text-sm font-medium">
                            Confirm PIN Code
                          </label>
                        </div>
                        <div className="flex justify-center">
                          <PincodeInput
                            value={field.state.value}
                            onChange={(value) => {
                              field.handleChange(value);
                            }}
                            disabled={isPending}
                            aria-invalid={field.state.meta.errors.length > 0}
                            aria-describedby={
                              field.state.meta.errors.length > 0
                                ? "confirm-pincode-error"
                                : undefined
                            }
                          />
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p
                            id="confirm-pincode-error"
                            className="text-sm text-destructive text-center animate-in fade-in-0 duration-200"
                          >
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                        {/* Success indicator when PINs match */}
                        {field.state.value.length === 6 &&
                          state.values.pincode === field.state.value &&
                          field.state.meta.errors.length === 0 && (
                            <p className="text-sm text-green-600 text-center animate-in fade-in-0 duration-200">
                              ✓ PIN codes match
                            </p>
                          )}
                      </div>
                    )}
                  </form.Field>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1"
                    disabled={isPending}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    disabled={!isFormValid || isPending || state.isSubmitting}
                    className="flex-1"
                    onClick={() => void form.handleSubmit()}
                  >
                    {isPending ? "Setting up..." : "Set PIN Code"}
                  </Button>
                </div>
              </div>
            );
          }}
        </form.Subscribe>
      </div>
    </div>
  );
}
