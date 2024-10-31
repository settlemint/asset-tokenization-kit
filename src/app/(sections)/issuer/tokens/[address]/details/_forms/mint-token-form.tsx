"use client";

import { DictionaryInput } from "@/components/blocks/form/form-input-dictionary";
import { NumericInput } from "@/components/blocks/form/form-input-numeric";
import { FormMultiStepProvider } from "@/components/blocks/form/form-multistep";
import { FormPage } from "@/components/blocks/form/form-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { mintTokenAction } from "./mint-token-action";
import { MintTokenSchema, type MintTokenSchemaType, mintTokenFormPageFields } from "./mint-token-form-schema";

interface MintTokenFormProps {
  defaultValues: Partial<MintTokenSchemaType>;
  formId: string;
  className?: string;
}

const MintTokenReceiptQuery = portalGraphql(`
query MintTokenReceiptQuery($transactionHash: String!) {
  getTransaction(transactionHash: $transactionHash) {
    receipt {
      contractAddress
      status
      blockNumber
    }
  }
}`);

const walletAddresses = [
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957926",
    label: "User 1",
  },
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957927",
    label: "User 2",
  },
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957928",
    label: "User 3",
  },
];

export function MintTokenForm({ defaultValues }: MintTokenFormProps) {
  const [localStorageState] = useLocalStorage<Partial<MintTokenSchemaType>>("state", defaultValues);

  const { form, resetFormAndAction } = useHookFormAction(mintTokenAction, zodResolver(MintTokenSchema), {
    actionProps: {
      onSuccess: () => {
        resetFormAndAction();
      },
    },
    formProps: {
      mode: "all",
      defaultValues: {
        ...mintTokenFormPageFields,
        ...defaultValues,
        ...localStorageState,
      },
    },
    errorMapProps: {},
  });

  function onSubmit(values: MintTokenSchemaType) {
    toast.promise(
      async () => {
        const transactionHash = await mintTokenAction(values);

        const startTime = Date.now();
        const timeout = 120000; // 2 minutes

        while (Date.now() - startTime < timeout) {
          const txresult = await portalClient.request(MintTokenReceiptQuery, {
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
        loading: "Minting token...",
        success: (data) => {
          return `${values.amount} tokens minted to (${values.to}) in block ${data.blockNumber}`;
        },
        error: (error) => {
          console.error(error);
          return `Error: ${error instanceof Error ? error.message : "An unexpected error occurred"}`;
        },
      },
    );
  }

  return (
    <div className="MinTokenForm container mt-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Mint new tokens</CardTitle>
          <CardDescription>Distribute your digital tokens to token holder</CardDescription>
        </CardHeader>
        <CardContent>
          <FormMultiStepProvider
            config={{ useLocalStorageState: false, useQueryState: false }}
            formId="mint-token-form"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormPage
                  form={form}
                  title="Mint tokens"
                  fields={["amount", "to"]}
                  withSheetClose
                  controls={{
                    submit: { buttonText: "Submit" },
                  }}
                >
                  {/* Mint amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <NumericInput placeholder="Amount" {...field} />
                        </FormControl>
                        <FormDescription>This is the amount of tokens you want to mint</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Mint to wallet */}
                  <FormField
                    control={form.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet address</FormLabel>
                        <FormControl>
                          <Input placeholder="To address" {...field} />
                        </FormControl>
                        <FormDescription>This is the wallet address of the token holder</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Mint to wallet */}
                  <FormField
                    control={form.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet address</FormLabel>
                        <FormControl>
                          <DictionaryInput placeholder="Search user wallet..." options={walletAddresses} {...field} />
                        </FormControl>
                        <FormDescription>This is the wallet address of the token holder</FormDescription>
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
