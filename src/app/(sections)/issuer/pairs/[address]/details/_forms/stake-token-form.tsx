"use client";

import { NumericInput } from "@/components/blocks/form/form-input-numeric";
import { FormMultiStepProvider } from "@/components/blocks/form/form-multistep";
import { FormPage } from "@/components/blocks/form/form-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { approveTokenAction } from "./approve-token-action";
import { stakeTokenAction } from "./stake-token-action";
import { StakeTokenSchema, type StakeTokenSchemaType, stakeTokenFormPageFields } from "./stake-token-form-schema";

interface StakeTokenFormProps {
  defaultValues: Partial<StakeTokenSchemaType>;
  formId: string;
  className?: string;
}

const StakeTokenReceiptQuery = portalGraphql(`
query StakeTokenReceiptQuery($transactionHash: String!) {
  getTransaction(transactionHash: $transactionHash) {
    receipt {
      contractAddress
      status
      blockNumber
    }
  }
}`);

// TODO: we need to provide deep insights in how the action will impact the pool

export function StakeTokenForm({ defaultValues, formId }: StakeTokenFormProps) {
  const [localStorageState] = useLocalStorage<Partial<StakeTokenSchemaType>>("state", defaultValues);

  const { form, resetFormAndAction } = useHookFormAction(stakeTokenAction, zodResolver(StakeTokenSchema), {
    actionProps: {
      onSuccess: () => {
        console.log("[Action Success]");
        resetFormAndAction();
      },
      onError: (error) => {
        console.error("[Action Error]:", error);
      },
    },
    formProps: {
      mode: "all",
      defaultValues: {
        ...stakeTokenFormPageFields,
        ...defaultValues,
        ...localStorageState,
      },
    },
    errorMapProps: {},
  });

  // Debug form values in real-time
  console.log("[Form Values]:", form.watch());

  // Debug form state
  console.log("[Form State]:", {
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  });

  // Debug validation
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log(`[Field Update] Name: ${name}, Type: ${type}`, "Value:", value, "Errors:", form.formState.errors);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  function onSubmit(values: StakeTokenSchemaType) {
    toast.promise(
      async () => {
        await Promise.all([
          approveTokenAction({
            tokenAddress: values.baseTokenAddress,
            spender: values.tokenAddress,
            approveAmount: values.baseAmount,
          }),
          approveTokenAction({
            tokenAddress: values.quoteTokenAddress,
            spender: values.tokenAddress,
            approveAmount: values.quoteAmount,
          }),
        ]);
        const transactionHash = await stakeTokenAction(values);

        const startTime = Date.now();
        const timeout = 240000; // 4 minutes

        while (Date.now() - startTime < timeout) {
          const txresult = await portalClient.request(StakeTokenReceiptQuery, {
            transactionHash: transactionHash?.data ?? "",
          });

          const receipt = txresult.getTransaction?.receipt;
          if (receipt) {
            if (receipt.status === "Success") {
              return receipt;
            }
            throw new Error("Transaction failed");
          }

          // Wait for 500 milliseconds before the next attempt
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        throw new Error(`Transaction not processed within ${timeout / 1000} seconds`);
      },
      {
        loading: "Staking tokens...",
        success: (data) => {
          return `${values.baseAmount}/${values.quoteAmount} tokens stakes in block ${data.blockNumber}`;
        },
        error: (error) => {
          console.error(error);
          return `Error: ${error instanceof Error ? error.message : "An unexpected error occurred"}`;
        },
      },
    );
  }

  return (
    <div className="StakeTokenForm container mt-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stake tokens</CardTitle>
          <CardDescription>Distribute your digital tokens to token holder</CardDescription>
        </CardHeader>
        <CardContent>
          <FormMultiStepProvider config={{ useLocalStorageState: false, useQueryState: false }} formId={formId}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormPage
                  form={form}
                  title="Stake tokens"
                  fields={["baseAmount", "quoteAmount"]} // This should be typed
                  withSheetClose
                  controls={{
                    submit: { buttonText: "Submit" },
                  }}
                >
                  {/* Base amount, should be enhanced with the actual token info */}
                  <FormField
                    control={form.control}
                    name="baseAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Amount</FormLabel>
                        <FormControl>
                          <NumericInput placeholder="Base Amount" {...field} />
                        </FormControl>
                        <FormDescription>This is the amount of base tokens you want to stake</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quoteAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quote Amount</FormLabel>
                        <FormControl>
                          <NumericInput placeholder="Quote Amount" {...field} />
                        </FormControl>
                        <FormDescription>This is the amount of quote tokens you want to stake</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormPage>
              </form>
            </Form>
          </FormMultiStepProvider>
        </CardContent>
      </Card>
    </div>
  );
}
