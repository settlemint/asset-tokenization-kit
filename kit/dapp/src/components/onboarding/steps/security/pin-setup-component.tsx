import { PincodeInput } from "@/components/onboarding/pincode-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth/auth.client";
import { queryClient } from "@/lib/query.client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";

const logger = createLogger({ level: "debug" });

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

interface PinSetupComponentProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function PinSetupComponent({
  onSuccess,
  onBack,
}: PinSetupComponentProps) {
  const { sessionKey } = useContext(AuthQueryContext);
  const [showConfirmPincode, setShowConfirmPincode] = useState(false);

  const form = useForm<PincodeFormValues>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
      confirmPincode: "",
    },
  });

  const { mutate: enablePincode, isPending } = useMutation({
    mutationFn: async (pincode: string) =>
      authClient.pincode.enablePincode({
        pincode,
      }),
    onSuccess: () => {
      toast.success("PIN code set successfully");
      void queryClient.invalidateQueries({
        queryKey: sessionKey,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      logger.error("enablePincode error:", error);
      toast.error(error.message || "Failed to set PIN code");
    },
  });

  const watchConfirmPincode = form.watch("confirmPincode");
  const watchPincode = form.watch("pincode");

  const handleSetPincode = useCallback(() => {
    if (watchPincode.length === 6) {
      setShowConfirmPincode(true);
    }
  }, [watchPincode]);

  const onSubmit = useCallback(
    (values: PincodeFormValues) => {
      enablePincode(values.pincode);
    },
    [enablePincode]
  );

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Set up PIN Code</h3>
        <p className="text-sm text-muted-foreground">
          Create a 6-digit PIN code to secure your wallet transactions
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="space-y-4">
                    <div className="text-center">
                      <label className="text-sm font-medium">
                        {!showConfirmPincode ? "Enter PIN Code" : "PIN Code"}
                      </label>
                    </div>
                    <PincodeInput
                      value={field.value}
                      onChange={(value: string) => {
                        field.onChange(value);
                        if (value.length === 6) {
                          handleSetPincode();
                        }
                      }}
                      onComplete={handleSetPincode}
                      disabled={showConfirmPincode}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showConfirmPincode && (
            <FormField
              control={form.control}
              name="confirmPincode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="text-center">
                        <label className="text-sm font-medium">
                          Confirm PIN Code
                        </label>
                      </div>
                      <PincodeInput
                        value={field.value}
                        onChange={field.onChange}
                        onComplete={() => {
                          if (watchConfirmPincode.length === 6) {
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Back
            </Button>
            {showConfirmPincode && (
              <Button
                type="submit"
                disabled={isPending || watchConfirmPincode.length !== 6}
                className="flex-1"
              >
                {isPending ? "Setting up..." : "Set PIN Code"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
