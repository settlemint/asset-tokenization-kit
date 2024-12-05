'use client';

import { Input } from '@/components/blocks/form/form-input';
import { FormMultiStep } from '@/components/blocks/form/form-multistep';
import { FormStep } from '@/components/blocks/form/form-step';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { createAddressBookEntryAction } from './create-address-book-entry-action';
import {
  CreateAddressBookEntrySchema,
  type CreateAddressBookEntrySchemaType,
  createAddressBookEntryFormStepFields,
} from './create-address-book-entry-schema';

interface CreateAddressBookEntryFormProps {
  defaultValues: Partial<CreateAddressBookEntrySchemaType>;
  formId: string;
  className?: string;
}

export function CreateAddressBookEntryForm({ defaultValues }: CreateAddressBookEntryFormProps) {
  const [localStorageState] = useLocalStorage<Partial<CreateAddressBookEntrySchemaType>>('state', defaultValues);

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
        mode: 'all',
        defaultValues: {
          ...createAddressBookEntryFormStepFields,
          ...defaultValues,
          ...localStorageState,
        },
      },
      errorMapProps: {},
    }
  );

  function onSubmit(values: CreateAddressBookEntrySchemaType) {
    toast.promise(
      async () => {
        await createAddressBookEntryAction(values);
        return { walletAddress: values.walletAddress! };
      },
      {
        loading: 'Saving address book entry...',
        success: (data: { walletAddress: string }) => {
          return `${data.walletAddress}  saved`;
        },
        error: (error) => {
          return `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`;
        },
      }
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
          <FormMultiStep
            config={{ useLocalStorageState: false }}
            formId="create-address-book-entry-form"
            form={form}
            onSubmit={onSubmit}
          >
            <FormStep
              form={form}
              title=""
              fields={['walletName']}
              withSheetClose
              controls={{
                submit: { buttonText: 'Save' },
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
                    <FormDescription>This is the wallet address you want to save to your addressbook</FormDescription>
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
            </FormStep>
          </FormMultiStep>
        </CardContent>
      </Card>
    </div>
  );
}
