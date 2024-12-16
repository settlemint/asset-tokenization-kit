'use client';

import { TextInput } from '@/components/forms/controls/text-input';
import { FormMultiStep } from '@/components/forms/form-multistep';
import { FormStep } from '@/components/forms/form-step';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {} from '@/components/ui/form';
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
              <TextInput
                control={form.control}
                label="Wallet address"
                name="walletAddress"
                description="This is the wallet address you want to save to your addressbook"
                placeholder="Address"
                disabled
              />
              {/* Alias name */}
              <TextInput
                control={form.control}
                label="Alias name"
                name="walletName"
                description="This is the alias name for this address in your addressbook"
                placeholder="Address"
              />
            </FormStep>
          </FormMultiStep>
        </CardContent>
      </Card>
    </div>
  );
}
