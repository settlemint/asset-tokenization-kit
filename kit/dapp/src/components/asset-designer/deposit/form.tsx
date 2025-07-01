import { FormInput } from "@/components/form/inputs/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { orpc } from "@/orpc";
import type { DepositTokenCreateSchema } from "@/orpc/routes/token/routes/deposit/deposit.create.schema";
import { DepositTokenCreateSchema as schema } from "@/orpc/routes/token/routes/deposit/deposit.create.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod/v4";

interface CreateDepositFormProps {
  onSuccess?: () => void;
}

type DepositFormData = z.infer<typeof DepositTokenCreateSchema>;

export function CreateDepositForm({ onSuccess }: CreateDepositFormProps) {
  // Initialize form with react-hook-form
  const form = useForm<DepositFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "deposit",
      name: "",
      symbol: "",
      decimals: 18,
      isin: "",
    },
  });

  // Set up mutation for deposit creation
  const { mutate: createDeposit, isPending } = useMutation({
    mutationFn: async (data: DepositFormData) => {
      return await orpc.token.depositCreate.call(data);
    },
    onSuccess: (transactionHash) => {
      toast.success("Deposit token created successfully!");
      console.log("Transaction hash:", transactionHash);
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create deposit token");
      console.error("Deposit creation error:", error);
    },
  });

  // Handle form submission
  const onSubmit = useCallback(
    (data: DepositFormData) => {
      createDeposit(data);
    },
    [createDeposit]
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Create Deposit Token</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Configure your deposit token by providing the basic information below.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                control={form.control}
                name="name"
                label="Token Name"
                placeholder="e.g., Government Bond Series A"
                description="The name of the token. This is used to identify the token in the UI and cannot be changed after creation."
                required
                maxLength={50}
              />
              <FormInput
                control={form.control}
                name="symbol"
                label="Token Symbol"
                placeholder="e.g., GBSA"
                description="A short symbol for the token (usually 3-5 characters)"
                required
                maxLength={10}
              />
            </div>

            <FormInput
              control={form.control}
              name="decimals"
              label="Decimals"
              type="number"
              min={0}
              max={18}
              placeholder="18"
              description="Number of decimal places for the token (0-18, default is 18)"
              required
            />
            <FormInput
              control={form.control}
              name="isin"
              label="ISIN (Optional)"
              placeholder="e.g., US0378331005"
              description="The ISIN of the asset. This is an optional unique identifier for the asset in the financial system."
              maxLength={12}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Deposit Token"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

CreateDepositForm.displayName = "CreateDepositForm";
