'use client';
import { TokenBasics } from '@/app/(private)/admin/tokens/_components/create-token-form/steps/1-token-basics';
import { FormMultiStep } from '@/components/blocks/form/form-multistep';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormStepProgress } from '@/components/blocks/form/form-step-progress';
import { TransactionStatus } from '@/components/blocks/transaction-status';
import { Card, CardContent } from '@/components/ui/card';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type TransactionReceiptWithDecodedError, waitForTransactionReceipt } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { useQueryState } from 'nuqs';
import { useState } from 'react';
import { createTokenAction } from './create-token-action';
import type { CreateTokenSchemaType } from './create-token-form-schema';
import {
  CreateTokenSchema,
  createTokenDefaultValues,
  validateCreateTokenSchemaFields,
} from './create-token-form-schema';
import { TokenConfiguration } from './steps/2-token-configuration';
import { Summary } from './steps/3-summary';

interface CreateTokenFormProps {
  defaultValues?: Partial<CreateTokenSchemaType>;
  tokenType: 'cryptocurrency' | 'stablecoin' | 'equity' | 'bond';
  formId: string;
  className?: string;
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

export function CreateTokenForm({ defaultValues, tokenType }: CreateTokenFormProps) {
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

  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined);
  const [transactionReceipt, setTransactionReceipt] = useState<TransactionReceiptWithDecodedError | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: CreateTokenSchemaType) {
    setTransactionStatus('pending');

    try {
      const createTokenResult = await createTokenAction({
        ...values,
      });

      if (createTokenResult?.serverError || createTokenResult?.validationErrors) {
        throw new Error('Error creating token');
      }

      const transactionHash = createTokenResult?.data;
      setTransactionHash(transactionHash);

      const receipt = await waitForTransactionReceipt({
        receiptFetcher: async () => {
          if (!transactionHash) {
            return;
          }
          const txresult = await portalClient.request(CreateTokenReceiptQuery, {
            transactionHash,
          });
          return txresult.StableCoinFactoryCreateReceipt;
        },
      });

      setTransactionReceipt(receipt);
      setTransactionStatus('success');
    } catch (error) {
      setTransactionStatus('error');
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }

  return (
    <div className="TokenizationWizard container mt-8">
      <FormStepProgress steps={3} currentStep={step} complete={false} className="" />
      <Card className="max-h-[calc(100vh-200px)] w-full overflow-scroll pt-10">
        <CardContent>
          {transactionStatus ? (
            <TransactionStatus
              status={transactionStatus}
              tokenName={form.getValues('tokenName')}
              transactionHash={transactionHash ?? undefined}
              receipt={transactionReceipt ?? undefined}
              error={error ?? undefined}
              onClose={() => {
                setTransactionStatus(null);
                resetFormAndAction();
              }}
              onCheckout={() => {
                // TODO: Implement checkout navigation
              }}
            />
          ) : (
            <FormMultiStep<CreateTokenSchemaType>
              form={form}
              config={{ useLocalStorageState: false }}
              formId="create-token-form"
              onSubmit={handleSubmit}
              validatePage={validateCreateTokenSchemaFields}
            >
              {/* Step 1 : Token basics */}
              <FormStep
                form={form}
                fields={['tokenName', 'tokenSymbol', 'decimals', 'isin']}
                withSheetClose
                controls={{
                  prev: { buttonText: 'Back' },
                  next: { buttonText: 'Confirm' },
                }}
              >
                <TokenBasics form={form} />
              </FormStep>

              {/* Step 2 : Token permissions */}
              <FormStep
                form={form}
                fields={['collateralProofValidityDuration', 'collateralThreshold']}
                withSheetClose
                controls={{
                  prev: { buttonText: 'Back' },
                  next: { buttonText: 'Confirm' },
                }}
              >
                <TokenConfiguration form={form} />
              </FormStep>

              {/* Step 3 : Summary */}
              <FormStep
                form={form}
                controls={{
                  prev: { buttonText: 'Back' },
                  submit: { buttonText: 'Create stable coin' },
                }}
              >
                <Summary form={form} />
              </FormStep>
            </FormMultiStep>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
