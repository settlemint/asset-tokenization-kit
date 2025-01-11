'use client';
import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { MultiSelectInput } from '@/components/blocks/form/controls/multi-select-input';
import { NumericInput } from '@/components/blocks/form/controls/numeric-input';
import { SelectInput } from '@/components/blocks/form/controls/select-input';
import { TextInput } from '@/components/blocks/form/controls/text-input';
import { FormMultiStep } from '@/components/blocks/form/form-multistep';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormStepProgress } from '@/components/blocks/form/form-step-progress';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import {} from '@/components/ui/form';
import { SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/lib/auth/client';
import { shortHex } from '@/lib/hex';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type TransactionReceiptWithDecodedError, waitForTransactionReceipt } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { Plus } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { toast } from 'sonner';
import type { Address } from 'viem';
import { createTokenAction } from './create-token-action';
import type { CreateTokenSchemaType } from './create-token-form-schema';
import { CreateTokenSchema, createTokenDefaultValues } from './create-token-form-schema';
import TermsConditions from './terms-conditions';

interface CreateTokenFormProps {
  defaultValues?: Partial<CreateTokenSchemaType>;
  formId: string;
  className?: string;
}

type AvatarUser = {
  wallet: Address;
  email?: string;
  name?: string;
};

interface TokenReceiptResponse {
  StarterKitERC20FactoryCreateTokenReceipt: TransactionReceiptWithDecodedError | null | undefined;
}

const CreateTokenReceiptQuery = portalGraphql(`
query CreateTokenReceiptQuery($transactionHash: String!) {
  StarterKitERC20FactoryCreateTokenReceipt(transactionHash: $transactionHash) {
    contractAddress
    status
    blockNumber
    revertReasonDecoded
  }
}`);

export function CreateTokenForm({ defaultValues }: CreateTokenFormProps) {
  const [step] = useQueryState('currentStep', {
    defaultValue: 1,
    parse: (value: string) => Number(value),
    serialize: (value: number) => String(value),
  });

  const { form, resetFormAndAction } = useHookFormAction(createTokenAction, zodResolver(CreateTokenSchema), {
    actionProps: {
      onSuccess: () => {
        resetFormAndAction();
      },
    },
    formProps: {
      mode: 'all',
      defaultValues: {
        ...createTokenDefaultValues,
        ...defaultValues,
      },
    },
    errorMapProps: {},
  });

  function onSubmit(values: CreateTokenSchemaType) {
    toast.promise(
      async () => {
        const transactionHash = await createTokenAction(values);
        return waitForTransactionReceipt({
          receiptFetcher: async (): Promise<TransactionReceiptWithDecodedError | null | undefined> => {
            const txresult = await portalClient.request<TokenReceiptResponse>(CreateTokenReceiptQuery, {
              transactionHash: transactionHash?.data ?? '',
            });
            return txresult.StarterKitERC20FactoryCreateTokenReceipt;
          },
        });
      },
      {
        loading: 'Creating token...',
        success: (data) => {
          return `${values.tokenName} (${values.tokenSymbol}) created in block ${data.blockNumber} on ${data.contractAddress}`;
        },
        error: (error) => {
          return `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`;
        },
      }
    );
    // TODO: update the table
  }
  const { data: userSession } = authClient.useSession();

  const currentUser = userSession?.user;
  const wallet = currentUser?.wallet as Address | undefined;
  const email = currentUser?.email;
  const name = currentUser?.name;

  const user: AvatarUser | undefined = wallet
    ? {
        wallet,
        email,
        name,
      }
    : undefined;

  const testUser = { ...user, wallet: '0x1234567890123456789012345678901234567890' as `0x${string}` };
  const users: AvatarUser[] = user ? [user, testUser] : [];

  const tokenPermissions = [
    { value: 'ADMIN', label: '  Admin' },
    { value: 'USER_MANAGER', label: 'User Manager' },
    { value: 'ISSUER', label: 'Issuer' },
  ];

  return (
    <div className="TokenizationWizard container mt-8">
      <FormStepProgress steps={4} currentStep={step} complete={true} className="" />
      <Card className="w-full">
        <CardContent>
          <FormMultiStep<CreateTokenSchemaType>
            form={form}
            config={{ useLocalStorageState: false }}
            formId="create-token-form"
            onSubmit={onSubmit}
          >
            {/* Step 1 */}
            <FormStep
              form={form}
              title="Introduction"
              controls={{
                next: { buttonText: 'Confirm' },
              }}
            >
              <TermsConditions />
            </FormStep>

            {/* Step 2 */}
            <FormStep
              form={form}
              fields={['tokenName', 'tokenSymbol']}
              withSheetClose
              controls={{
                prev: { buttonText: 'Back' },
                next: { buttonText: 'Confirm' },
              }}
            >
              <CardTitle>Token basics</CardTitle>
              <CardDescription>Provide the general information required to define your token.</CardDescription>
              {/* Name */}
              <TextInput
                control={form.control}
                label="Name"
                name="tokenName"
                placeholder="e.g., My Stable Coin"
                showRequired
              />

              {/* Symbol */}
              <TextInput
                control={form.control}
                label="Symbol"
                name="tokenSymbol"
                placeholder="e.g., MSC"
                showRequired
              />

              {/* Decimals */}
              <NumericInput
                control={form.control}
                label="Decimals"
                name="decimals"
                placeholder="e.g., MSC"
                showRequired
              />

              {/* ISIN */}
              <TextInput control={form.control} label="ISIN" name="isin" placeholder="e.g., US1234567890" />

              <CardTitle className="!mt-16">Stable coin configuration</CardTitle>
              <CardDescription>Set parameters specific to your stable coin.</CardDescription>

              {/* Collateral Proof Validity (Seconds) */}
              <NumericInput
                control={form.control}
                label="Collateral Proof Validity (Seconds)"
                name="collateralProofValidity"
                placeholder="e.g., 3600"
                showRequired
              />

              {/* Token Logo */}
              {/*<FileInput
                control={form.control}
                name="tokenLogo"
                description="This is the logo of the token"
                label="Token Logo"
                text="Click, or drop your logo here"
                multiple={false}
                maxSize={1024 * 1024 * 10} // 10MB
                accept={{
                  'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
                  'text/*': [],
                }}
                server={{
                  bucket: 'default-bucket',
                  storage: 'minio',
                }}
              />*/}
            </FormStep>

            {/* Step 3 */}
            <FormStep
              form={form}
              fields={['tokenName', 'tokenSymbol']}
              withSheetClose
              controls={{
                prev: { buttonText: 'Back' },
                next: { buttonText: 'Confirm' },
              }}
            >
              <CardTitle>Token permissions</CardTitle>
              <CardDescription>Define administrative roles and permissions for managing this token.</CardDescription>

              {/* Token permissions */}
              <div className="flex flex-col gap-10">
                <div className="RepeatItem">
                  <div className="User flex items-center gap-2">
                    <AddressAvatar address={user?.wallet} email={user?.email} className="h-9 w-9 rounded-full" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      {user?.name || user?.email ? (
                        <span className="truncate font-semibold">{user?.name ?? user?.email}</span>
                      ) : (
                        <Skeleton className="h-4 w-24" />
                      )}
                      {user?.wallet ? (
                        <span className="truncate text-xs">{shortHex(user?.wallet, 12, 8)}</span>
                      ) : (
                        <Skeleton className="h-3 w-20" />
                      )}
                    </div>
                  </div>
                  <MultiSelectInput entries={tokenPermissions} name="tokenPermissions" control={form.control} />
                </div>

                <div className="flex items-center gap-20">
                  <SelectInput
                    label="Add another admin:"
                    name="admin"
                    control={form.control}
                    placeholder="Select an admin"
                  >
                    {users.map((user) => (
                      <SelectItem
                        key={user.wallet}
                        value={user.wallet}
                        className="h-auto w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
                      >
                        <AddressAvatar address={user.wallet} email={user.email} className="h-9 w-9 rounded-full" />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          {user.name || user.email ? (
                            <span className="truncate font-semibold">{user.name ?? user.email}</span>
                          ) : (
                            <Skeleton className="h-4 w-24" />
                          )}
                          {user.wallet ? (
                            <span className="truncate text-xs">{shortHex(user.wallet, 12, 8)}</span>
                          ) : (
                            <Skeleton className="h-3 w-20" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectInput>
                  <button type="button" className="mt-6 cursor-pointer rounded-full border border-dotted p-2">
                    <Plus className="h-4 w-4" color="hsl(var(--foreground))" />
                  </button>
                </div>
              </div>
            </FormStep>
            <FormStep
              form={form}
              title="Review"
              controls={{
                prev: { buttonText: 'Back' },
                submit: { buttonText: 'Submit' },
              }}
            >
              <div>Review</div>
            </FormStep>
          </FormMultiStep>
        </CardContent>
      </Card>
    </div>
  );
}
