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
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  const queryClient = useQueryClient();

  const form = useForm<PincodeFormValues>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
      confirmPincode: "",
    },
  });

  const { mutate: enablePincode, isPending } = useMutation({
    mutationFn: async (pincode: string) =>
      authClient.pincode.enable({
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

  const handlePincodeChange = useCallback(
    (value: string) => {
      form.setValue("pincode", value);
      if (value.length === 6) {
        handleSetPincode();
      }
    },
    [form, handleSetPincode]
  );

  const handleConfirmComplete = useCallback(() => {
    if (watchConfirmPincode.length === 6) {
      void form.handleSubmit(onSubmit)();
    }
  }, [watchConfirmPincode, form, onSubmit]);

  const handleSetPinClick = useCallback(() => {
    void form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  const renderPincodeField = useCallback(
    ({
      field,
    }: {
      field: { value: string; onChange: (value: string) => void };
    }) => (
      <FormItem>
        <FormControl>
          <div className="space-y-4">
            <div className="text-center">
              <label className="text-sm font-medium">
                {!showConfirmPincode ? "Enter PIN Code" : "PIN Code"}
              </label>
            </div>
            <div className="flex justify-center">
              <PincodeInput
                value={field.value}
                onChange={handlePincodeChange}
                onComplete={handleSetPincode}
                disabled={showConfirmPincode}
              />
            </div>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
    [showConfirmPincode, handlePincodeChange, handleSetPincode]
  );

  const renderConfirmPincodeField = useCallback(
    ({
      field,
    }: {
      field: { value: string; onChange: (value: string) => void };
    }) => (
      <FormItem>
        <FormControl>
          <div className="space-y-4">
            <div className="text-center">
              <label className="text-sm font-medium">Confirm PIN Code</label>
            </div>
            <div className="flex justify-center">
              <PincodeInput
                value={field.value}
                onChange={field.onChange}
                onComplete={handleConfirmComplete}
              />
            </div>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
    [handleConfirmComplete]
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
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="pincode"
            render={renderPincodeField}
          />

          {showConfirmPincode && (
            <FormField
              control={form.control}
              name="confirmPincode"
              render={renderConfirmPincodeField}
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
            <Button
              type="button"
              onClick={handleSetPinClick}
              disabled={
                !showConfirmPincode ||
                isPending ||
                watchConfirmPincode.length !== 6
              }
              className="flex-1"
            >
              {isPending ? "Setting up..." : "Set PIN Code"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
