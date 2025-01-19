'use client';
import { TokenBasics } from '@/app/(private)/admin/tokens/_components/create-token-form/steps/1-token-basics';
import {
  TokenPermissions,
  users as _users,
} from '@/app/(private)/admin/tokens/_components/create-token-form/steps/2-token-permissions';
import { FormMultiStep } from '@/components/blocks/form/form-multistep';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormStepProgress } from '@/components/blocks/form/form-step-progress';
import { Card, CardContent } from '@/components/ui/card';
import {} from '@/components/ui/form';
import type { User } from '@/lib/auth/types';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type TransactionReceiptWithDecodedError, waitForTransactionReceipt } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { createTokenAction } from './create-token-action';
import type { CreateTokenSchemaType } from './create-token-form-schema';
import {
  CreateTokenSchema,
  createTokenDefaultValues,
  validateCreateTokenSchemaFields,
} from './create-token-form-schema';
import { TokenDistribution } from './steps/3-token-distribution';

interface CreateTokenFormProps {
  defaultValues?: Partial<CreateTokenSchemaType>;
  formId: string;
  className?: string;
  users: User[];
}

const CreateTokenReceiptQuery = portalGraphql(`
query CreateTokenReceiptQuery($transactionHash: String!) {
  StableCoinFactoryCreateReceipt(transactionHash: $transactionHash) {
    contractAddress
    status
    blockNumber
    revertReasonDecoded
  }
}`);

export function CreateTokenForm({ defaultValues, users }: CreateTokenFormProps) {
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
        tokenPermissions: _users
          .map((user) => ({
            id: user.id,
            wallet: user.wallet,
            email: user.email,
            name: user.name,
            tokenPermissions: user.tokenPermissions,
          }))
          .slice(2),
      },
    },
    errorMapProps: {},
  });

  function onSubmit(values: CreateTokenSchemaType) {
    toast.promise(
      async () => {
        const createTokenResult = await createTokenAction(values);
        if (createTokenResult?.serverError || createTokenResult?.validationErrors) {
          throw new Error('Error creating token');
        }
        return await waitForTransactionReceipt({
          receiptFetcher: async (): Promise<TransactionReceiptWithDecodedError | null | undefined> => {
            const transactionHash = createTokenResult?.data ?? '';
            if (!transactionHash) {
              return;
            }
            const txresult = await portalClient.request(CreateTokenReceiptQuery, {
              transactionHash,
            });
            return txresult.StableCoinFactoryCreateReceipt;
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

  return (
    <div className="TokenizationWizard container mt-8">
      <FormStepProgress steps={4} currentStep={step} complete={false} className="" />
      <Card className="w-full pt-10">
        <CardContent>
          <FormMultiStep<CreateTokenSchemaType>
            form={form}
            config={{ useLocalStorageState: false }}
            formId="create-token-form"
            onSubmit={onSubmit}
          >
            {/* Step 1 : Token basics */}
            <FormStep
              form={form}
              fields={['tokenName', 'tokenSymbol', 'decimals', 'collateralProofValidity']}
              withSheetClose
              controls={{
                prev: { buttonText: 'Back' },
                next: { buttonText: 'Confirm' },
              }}
              validatePage={validateCreateTokenSchemaFields}
            >
              <TokenBasics form={form} />
            </FormStep>

            {/* Step 2 : Token permissions */}
            <FormStep
              form={form}
              fields={['tokenPermissions']}
              withSheetClose
              controls={{
                prev: { buttonText: 'Back' },
                next: { buttonText: 'Confirm' },
              }}
              validatePage={validateCreateTokenSchemaFields}
            >
              <TokenPermissions form={form} />
            </FormStep>

            {/* Step 3 : Token distribution */}
            <FormStep
              form={form}
              fields={['tokenDistribution']}
              withSheetClose
              controls={{
                prev: { buttonText: 'Back' },
                next: { buttonText: 'Confirm' },
              }}
              validatePage={validateCreateTokenSchemaFields}
            >
              <TokenDistribution form={form} />
            </FormStep>

            {/* Step 4 : Review */}
            <FormStep
              form={form}
              title="Review"
              controls={{
                prev: { buttonText: 'Back' },
                submit: { buttonText: 'Create stable coin' },
              }}
              validatePage={validateCreateTokenSchemaFields}
            >
              <div>Review</div>
            </FormStep>
          </FormMultiStep>
        </CardContent>
      </Card>
    </div>
  );
}
