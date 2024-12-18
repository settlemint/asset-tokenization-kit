'use client';
import { DictionaryInput } from '@/components/blocks/form/controls/form-input-dictionary';
import { NumericInput } from '@/components/blocks/form/controls/form-input-numeric';
import { TextInput } from '@/components/blocks/form/controls/text-input';
import { FormMultiStep } from '@/components/blocks/form/form-multistep';
import { FormStep } from '@/components/blocks/form/form-step';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { waitForTransactionReceipt } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { mintTokenAction } from './mint-token-action';
import { MintTokenSchema, type MintTokenSchemaType, mintTokenFormStepFields } from './mint-token-form-schema';

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
      revertReasonDecoded
    }
  }
}`);

const walletAddresses = [
  {
    value: '0xb794f5ea0ba39494ce839613fffba7427957926',
    label: 'User 1',
  },
  {
    value: '0xb794f5ea0ba39494ce839613fffba7427957927',
    label: 'User 2',
  },
  {
    value: '0xb794f5ea0ba39494ce839613fffba7427957928',
    label: 'User 3',
  },
];

export function MintTokenForm({ defaultValues }: MintTokenFormProps) {
  const [localStorageState] = useLocalStorage<Partial<MintTokenSchemaType>>('state', defaultValues);
  const queryClient = useQueryClient();

  const { form, resetFormAndAction } = useHookFormAction(mintTokenAction, zodResolver(MintTokenSchema), {
    actionProps: {
      onSuccess: () => {
        resetFormAndAction();
      },
    },
    formProps: {
      mode: 'all',
      defaultValues: {
        ...mintTokenFormStepFields,
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
        return waitForTransactionReceipt({
          receiptFetcher: async () => {
            const txresult = await portalClient.request(MintTokenReceiptQuery, {
              transactionHash: transactionHash?.data ?? '',
            });

            return txresult.getTransaction?.receipt;
          },
        });
      },
      {
        loading: 'Minting token...',
        success: (data) => {
          queryClient.invalidateQueries({ queryKey: ['token-volumes'] });
          return `${values.amount} tokens minted to (${values.to}) in block ${data.blockNumber}`;
        },
        error: (error) => {
          queryClient.invalidateQueries({ queryKey: ['token-volumes'] });
          return `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`;
        },
      }
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
          <FormMultiStep<MintTokenSchemaType>
            config={{ useLocalStorageState: false }}
            form={form}
            formId="mint-token-form"
            onSubmit={onSubmit}
          >
            <FormStep
              form={form}
              title="Mint tokens"
              fields={['amount', 'to']}
              withSheetClose
              controls={{
                submit: { buttonText: 'Submit' },
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
              <TextInput
                control={form.control}
                label="Wallet address"
                name="to"
                description="This is the wallet address of the token holder"
                placeholder="To address"
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
            </FormStep>
          </FormMultiStep>
        </CardContent>
      </Card>
    </div>
  );
}
