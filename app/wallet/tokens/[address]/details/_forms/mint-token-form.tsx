"use client";

import { FormMultiStepProvider } from "@/components/ui-settlemint/form-multistep";
import { FormPage } from "@/components/ui-settlemint/form-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { portalClient, portalGraphql } from "@/lib/settlemint/clientside/portal";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { mintToken } from "./mint-token-action";
import { type MintWizardSchema, MintWizardValidator, mintWizardDefaultValues } from "./mint-token-form-validation";

export interface MintTokenFormProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValues: Partial<MintWizardSchema>;
  address: string;
}

const CreateTokenReceiptQuery = portalGraphql(`
query CreateTokenReceiptQuery($transactionHash: String!) {
  getTransaction(transactionHash: $transactionHash) {
    receipt {
      contractAddress
      status
      blockNumber
    }
  }
}`);

export function MintTokenForm({ className, defaultValues, address, ...props }: MintTokenFormProps) {
  const [localStorageState, setLocalStorageState] = useLocalStorage<Partial<MintWizardSchema>>("state", defaultValues);

  const form = useForm<MintWizardSchema>({
    resolver: zodResolver(MintWizardValidator),
    defaultValues: { ...mintWizardDefaultValues, ...defaultValues, ...localStorageState },
    mode: "all",
  });

  function onSubmit(values: MintWizardSchema) {
    toast.promise(
      async () => {
        const transactionHash = await mintToken(address, values);

        const startTime = Date.now();
        const timeout = 120000; // 2 minutes

        while (Date.now() - startTime < timeout) {
          const txresult = await portalClient.request(CreateTokenReceiptQuery, {
            transactionHash,
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
        loading: "Minting token...",
        success: (data) => {
          return `Minted ${values.amount} tokens to ${values.toAddress} in block ${data.blockNumber} on ${data.contractAddress}`;
        },
        error: (error) => {
          console.error(error);
          return `Error: ${error instanceof Error ? error.message : "An unexpected error occurred"}`;
        },
      },
    );
    // TODO: close the modal
    // TODO: update the table
  }

  return (
    <div className="TokenizationWizard container mt-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Mint new tokens</CardTitle>
          <CardDescription>Issue a new token.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormMultiStepProvider
            config={{ useLocalStorageState: false, useQueryState: false }}
            formId="create-token-form"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormPage form={form} title="Mint Token" fields={["amount", "toAddress"]}>
                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Amount"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>This is the amount of tokens to mint</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* To Address */}
                  <FormField
                    control={form.control}
                    name="toAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Address</FormLabel>
                        <FormControl>
                          <Input placeholder="To Address" {...field} />
                        </FormControl>
                        <FormDescription>This is the address to mint the tokens to</FormDescription>
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
