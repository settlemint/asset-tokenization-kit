"use client";

import { FormMultiStepProvider } from "@/components/blocks/form/form-multistep";
import { FormPage } from "@/components/blocks/form/form-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { createAddressBookEntryAction } from "./create-address-book-entry-action";
import {
  CreateAddressBookEntrySchema,
  type CreateAddressBookEntrySchemaType,
  createAddressBookEntryFormPageFields,
} from "./create-address-book-entry-schema";

interface CreateAddressBookEntryFormProps {
  defaultValues: Partial<CreateAddressBookEntrySchemaType>;
  formId: string;
  className?: string;
}

export function CreateAddressBookEntryForm({ defaultValues }: CreateAddressBookEntryFormProps) {
  const [localStorageState] = useLocalStorage<Partial<CreateAddressBookEntrySchemaType>>("state", defaultValues);

  const { form, resetFormAndAction } = useHookFormAction(
    createAddressBookEntryAction,
    zodResolver(CreateAddressBookEntrySchema),
    {
      actionProps: {
        onSuccess: () => {
          resetFormAndAction();
        },
      },
      formProps: {
        mode: "all",
        defaultValues: {
          ...createAddressBookEntryFormPageFields,
          ...defaultValues,
          ...localStorageState,
        },
      },
      errorMapProps: {},
    },
  );

  function onSubmit(values: CreateAddressBookEntrySchemaType) {
    toast.promise(
      async () => {
        await createAddressBookEntryAction(values);
      },
      {
        loading: "Saving address book entry...",
        success: (data) => {
          return "address book entry saved";
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
          <CardTitle>Create Addressbook entry</CardTitle>
          <CardDescription>Add this wallet to your Addressbook</CardDescription>
        </CardHeader>
        <CardContent>
          <FormMultiStepProvider
            config={{ useLocalStorageState: false, useQueryState: false }}
            formId="create-address-book-entry-form"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormPage
                  form={form}
                  title=""
                  fields={["walletName"]}
                  withSheetClose
                  controls={{
                    submit: { buttonText: "Save" },
                  }}
                >
                  {/* Wallet address */}
                  <FormField
                    control={form.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet address</FormLabel>
                        <FormControl>
                          <Input placeholder="Address" {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          This is the wallet address you want to save to your addressbook
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Alias name */}
                  <FormField
                    control={form.control}
                    name="walletName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alias name</FormLabel>
                        <FormControl>
                          <Input placeholder="Alias name" {...field} />
                        </FormControl>
                        <FormDescription>This is the alias name for this address in your addressbook</FormDescription>
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
