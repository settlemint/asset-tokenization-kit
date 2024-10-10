"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormMultiStepProvider } from "@/components/ui/form-multistep";
import { FormPage } from "@/components/ui/form-page";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { createToken } from "./create-token-action";
import {
  type TokenizationWizardSchema,
  TokenizationWizardValidator,
  tokenizationWizardDefaultValues,
} from "./create-token-form-validation";

export interface CreateTokenFormProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValues: Partial<TokenizationWizardSchema>;
}

export function CreateTokenForm({ className, defaultValues, ...props }: CreateTokenFormProps) {
  const [localStorageState, setLocalStorageState] = useLocalStorage<Partial<TokenizationWizardSchema>>(
    "state",
    defaultValues,
  );

  const form = useForm<TokenizationWizardSchema>({
    resolver: zodResolver(TokenizationWizardValidator),
    defaultValues: { ...tokenizationWizardDefaultValues, ...defaultValues, ...localStorageState },
    mode: "all",
  });

  function onSubmit(values: TokenizationWizardSchema) {
    toast.promise(
      async () => {
        return createToken(values);
      },
      {
        loading: "Creating token...",
        success: (data) => {
          return `${values.tokenName} (${values.tokenSymbol}) created in block ${data.blockNumber} on ${data.contractAddress}`;
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
          <CardTitle>Create a new token</CardTitle>
          <CardDescription>Issue a new token.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormMultiStepProvider config={{ useLocalStorageState: false, useQueryState: false }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormPage form={form} title="Introduction">
                  <div>
                    <p>Easily convert your assets into digital tokens using this step-by-step wizard.</p>
                    <p>Let's get started!</p>
                  </div>
                  {/* TODO: allow me to set the next and cancel button text*/}
                </FormPage>
                <FormPage form={form} title="Terms & Conditions">
                  <p>By proceeding with the tokenization process, you agree to the following:</p>
                  <ul>
                    <li>
                      Ensure that all asset details provided are accurate and comply with local laws and regulations.
                    </li>
                    <li>You are solely responsible for the legal implications of tokenizing assets.</li>
                    <li>We do not offer legal or financial advice regarding tokenized assets.</li>
                    <li>Your use of the platform is subject to our Privacy Policy and Terms of Service.</li>
                  </ul>
                  <p>Please review the full terms before continuing.</p>
                  {/* TODO: do we want a formal check box here? */}
                </FormPage>
                <FormPage form={form} title="Token Information" fields={["tokenName", "tokenSymbol"]}>
                  {/* Token Name */}
                  <FormField
                    control={form.control}
                    name="tokenName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token name</FormLabel>
                        <FormControl>
                          <Input placeholder="Token Name" {...field} />
                        </FormControl>
                        <FormDescription>This is the name of the token</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Token Symbol */}
                  <FormField
                    control={form.control}
                    name="tokenSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="Token Symbol" {...field} />
                        </FormControl>
                        <FormDescription>This is the symbol of the token</FormDescription>
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
