import { PincodeInput } from "@/components/form/inputs/pincode-input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { pincode } from "@/lib/zod/validators/pincode";
import { orpc } from "@/orpc/orpc-client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const logger = createLogger({ level: "debug" });

interface PinSetupComponentProps {
  onSuccess: () => void;
  onBack: () => void;
}

// TODO: the auto submit is super weird, why not just use the button?
export function PinSetupComponent({
  onSuccess,
  onBack,
}: PinSetupComponentProps) {
  const [showConfirmPincode, setShowConfirmPincode] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: enablePincode, isPending } = useMutation({
    mutationFn: async (pincode: string) =>
      authClient.pincode.enable({
        pincode,
      }),
    onSuccess: () => {
      toast.success("PIN code set successfully");
      void queryClient.invalidateQueries({
        queryKey: orpc.user.me.key(),
        refetchType: "all",
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
      onSubmit: ({ value }) => {
        // Validate pincode using zod validator
        const pincodeResult = pincode().safeParse(value.pincode);
        if (!pincodeResult.success) {
          return {
            fields: {
              pincode:
                pincodeResult.error.issues[0]?.message ?? "Invalid PIN code",
            },
          };
        }

        // Validate confirm pincode using zod validator
        const confirmPincodeResult = pincode().safeParse(value.confirmPincode);
        if (!confirmPincodeResult.success) {
          return {
            fields: {
              confirmPincode:
                confirmPincodeResult.error.issues[0]?.message ??
                "Invalid PIN code",
            },
          };
        }

        // Check if both match
        if (value.pincode !== value.confirmPincode) {
          return { fields: { confirmPincode: "PIN codes don't match" } };
        }
      },
    },
    onSubmit: ({ value }) => {
      enablePincode(value.pincode);
    },
  });

  const handlePincodeChange = useCallback(
    (value: string) => {
      form.setFieldValue("pincode", value);
      if (value.length === 6 && !showConfirmPincode) {
        setShowConfirmPincode(true);
      }
    },
    [form, showConfirmPincode]
  );

  const handleConfirmPincodeChange = useCallback(
    (value: string) => {
      form.setFieldValue("confirmPincode", value);
      if (value.length === 6) {
        void form.handleSubmit();
      }
    },
    [form]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Set up PIN Code</h3>
            <p className="text-sm text-muted-foreground">
              Create a 6-digit PIN code to secure your wallet transactions
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <div className="space-y-6">
              <form.Field name="pincode">
                {(field) => (
                  <div className="space-y-4">
                    <div className="text-center">
                      <label className="text-sm font-medium">
                        {!showConfirmPincode ? "Enter PIN Code" : "PIN Code"}
                      </label>
                    </div>
                    <div className="flex justify-center">
                      <PincodeInput
                        value={field.state.value}
                        onChange={handlePincodeChange}
                        disabled={showConfirmPincode}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive text-center">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {showConfirmPincode && (
                <form.Field name="confirmPincode">
                  {(field) => (
                    <div className="space-y-4">
                      <div className="text-center">
                        <label className="text-sm font-medium">
                          Confirm PIN Code
                        </label>
                      </div>
                      <div className="flex justify-center">
                        <PincodeInput
                          value={field.state.value}
                          onChange={handleConfirmPincodeChange}
                        />
                      </div>
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive text-center">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <footer className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            type="button"
            disabled={
              !showConfirmPincode ||
              isPending ||
              form.state.values.confirmPincode.length !== 6
            }
            onClick={async () => form.handleSubmit()}
          >
            {isPending ? "Setting up..." : "Set PIN Code"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
