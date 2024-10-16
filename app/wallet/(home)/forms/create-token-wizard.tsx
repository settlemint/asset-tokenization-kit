"use client";

import { createTokenAction } from "@/app/wallet/(home)/forms/create-token-wizard.action";
import { Dropzone } from "@/components/ui-settlemint/dropzone-s3";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import type * as React from "react";
import { useLocalStorage } from "usehooks-ts";
import { FormMultiStepProvider } from "../../../../components/ui-settlemint/form-multistep";
import { FormPage } from "../../../../components/ui-settlemint/form-page";
import { RepeatableForm } from "../../../../components/ui-settlemint/form-repeatable";
import { Checkbox } from "../../../../components/ui/checkbox";
import { NumericInput } from "../../../../components/ui/input-numeric";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import {
  CreateTokenWizardSchema,
  type CreateTokenWizardSchemaType,
  createTokenWizardFormPageFields,
} from "./create-token-wizard.schema";

export interface CreateTokenWizardProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValues: Partial<CreateTokenWizardSchemaType>;
  formId: string;
}

export function CreateTokenWizard({ className, defaultValues, formId, ...props }: CreateTokenWizardProps) {
  const [localStorageState, setLocalStorageState] = useLocalStorage<Partial<CreateTokenWizardSchemaType>>(
    "state",
    defaultValues,
  );

  const { form, handleSubmitWithAction, resetFormAndAction } = useHookFormAction(
    createTokenAction,
    zodResolver(CreateTokenWizardSchema),
    {
      actionProps: {
        onSuccess: () => {
          resetFormAndAction();
        },
      },
      formProps: {
        mode: "all",
        defaultValues: { ...createTokenWizardFormPageFields, ...defaultValues, ...localStorageState },
      },
      errorMapProps: {},
    },
  );

  return (
    <div className="CreateTokenWizard container mt-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create Token</CardTitle>
          <CardDescription>Issue a new token.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormMultiStepProvider formId={formId} config={{ useLocalStorageState: false, useQueryState: false }}>
            <Form {...form}>
              <form onSubmit={handleSubmitWithAction} className="space-y-4">
                <FormPage
                  form={form}
                  title="Introduction"
                  controls={{
                    next: { buttonText: "Continue" },
                  }}
                >
                  <div>INTROPAGE</div>
                </FormPage>
                <FormPage
                  form={form}
                  title="Terms & Conditions"
                  controls={{
                    prev: { buttonText: "Back" },
                    next: { buttonText: "Continue" },
                  }}
                >
                  <div>TERMS & CONDITIONS</div>
                </FormPage>
                <FormPage
                  form={form}
                  title="Token Information"
                  fields={["tokenName", "tokenSymbol", "tokenLogo"]}
                  controls={{
                    prev: { buttonText: "Back" },
                    next: { buttonText: "Continue" },
                  }}
                >
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
                  {/* Token Logo */}
                  <FormField
                    control={form.control}
                    name="tokenLogo"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Token Logo</FormLabel>
                          <FormControl>
                            <Dropzone
                              label="Click, or drop your logo here"
                              name={field.name}
                              accept={{ images: [".jpg", ".jpeg", ".png", ".webp"], text: [] }}
                              maxSize={1024 * 1024 * 10}
                              maxFiles={10}
                              multiple={true}
                            />
                          </FormControl>
                          <FormDescription>This is the logo of the token</FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </FormPage>
                <FormPage
                  form={form}
                  title="Token Economics"
                  fields={["tokenMaxSupply", "tokenHasMaxSupply", "walletEntries"]}
                  controls={{
                    prev: { buttonText: "Back" },
                    next: { buttonText: "Continue" },
                  }}
                >
                  {/* Token Has Max Supply */}
                  <FormField
                    control={form.control}
                    name="tokenHasMaxSupply"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max supply</FormLabel>
                        <FormControl>
                          <div>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                        </FormControl>
                        <FormDescription>This enables max supply for the token</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Token Max Supply */}
                  <FormField
                    control={form.control}
                    name="tokenMaxSupply"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max supply</FormLabel>
                        <FormControl>
                          <NumericInput name={field.name} placeholder="Max supply" />
                        </FormControl>
                        <FormDescription>This is the max supply of the token</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Initial distribution */}
                  <FormField
                    control={form.control}
                    name="walletEntriesCsvFileUpload"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload CSV file</FormLabel>
                        <FormControl>
                          <Dropzone
                            label="Click, or drop your CSV file here"
                            name={field.name}
                            accept={{ images: [], text: [".csv"] }}
                            maxSize={1024 * 1024 * 10}
                            maxFiles={10}
                            multiple={true}
                          />
                        </FormControl>
                        <FormDescription>
                          You can upload a csv file with the wallet addresses for the initial distribution of the token
                          supply
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Initial distribution */}
                  <FormField
                    control={form.control}
                    name="walletEntries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallets</FormLabel>
                        <FormControl>
                          <RepeatableForm
                            control={form.control}
                            name={field.name}
                            components={[
                              { type: "Input", field: "walletAddress", placeholder: "Wallet" },
                              { type: "NumericInput", field: "amount", placeholder: "Amount" },
                              { type: "Textarea", field: "ID", placeholder: "ID" },
                            ]}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the wallet addresses for the initial distribution of the token supply
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormPage>
                <FormPage
                  form={form}
                  title="Token Documentation"
                  fields={["currency"]}
                  controls={{
                    prev: { buttonText: "Back" },
                    next: { buttonText: "Continue" },
                  }}
                >
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="tokenCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BONDS">Bonds</SelectItem>
                            <SelectItem value="EQUITIES">Equities</SelectItem>
                            <SelectItem value="DERIVATIVES">Derivatives</SelectItem>
                            <SelectItem value="LOANS">Loans</SelectItem>
                            <SelectItem value="FUNDS">Funds</SelectItem>
                            <SelectItem value="COMMODITIES">Commodities</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>This is the type of financial instrument</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Monetary value */}
                  <FormField
                    control={form.control}
                    name="monetaryValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monetary value</FormLabel>
                        <FormControl>
                          <NumericInput name={field.name} placeholder="Monetary value" />
                        </FormControl>
                        <FormDescription>This is the monetary value per token</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Currency */}
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                            <SelectItem value="JPY">JPY</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>This is the currency for the monetary value of token</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Documentation upload */}
                  <FormField
                    control={form.control}
                    name="DocumentationFileUploads"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload documentation files</FormLabel>
                        <FormControl>
                          <Dropzone
                            label="Click, or drop your documents here"
                            name={field.name}
                            uploadDir="documentation"
                            accept={{ images: [".jpg", ".jpeg", ".png", ".webp"], text: [".pdf"] }}
                            maxSize={1024 * 1024 * 10}
                            maxFiles={10}
                            multiple={true}
                          />
                        </FormControl>
                        <FormDescription>You can upload documentation files for the token</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormPage>
                <FormPage
                  form={form}
                  title="Token administrators"
                  controls={{
                    prev: { buttonText: "Back" },
                    next: { buttonText: "Continue" },
                  }}
                >
                  {/* Token administrators */}
                  <FormField
                    control={form.control}
                    name="adminWalletAddresses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallets</FormLabel>
                        <FormControl>
                          <RepeatableForm
                            control={form.control}
                            name={field.name}
                            components={[
                              { type: "Input", field: "walletAddress", placeholder: "Wallet" },
                              { type: "NumericInput", field: "amount", placeholder: "Amount" },
                              { type: "Textarea", field: "ID", placeholder: "ID" },
                            ]}
                          />
                        </FormControl>
                        <FormDescription>Enter the wallet addresses for the Token administrators</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormPage>
                <FormPage
                  form={form}
                  title="Review"
                  withSheetClose
                  controls={{
                    prev: { buttonText: "Back" },
                    submit: { buttonText: "Submit" },
                  }}
                >
                  <div>Review</div>
                </FormPage>
              </form>
            </Form>
          </FormMultiStepProvider>
        </CardContent>
      </Card>
    </div>
  );
}
