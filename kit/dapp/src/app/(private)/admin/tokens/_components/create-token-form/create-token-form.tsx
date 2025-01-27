'use client';
import { TokenBasics } from '@/app/(private)/admin/tokens/_components/create-token-form/steps/1-token-basics';
import { FormMultiStep } from '@/components/blocks/form/form-multistep';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormStepProgress } from '@/components/blocks/form/form-step-progress';
import { TransactionStatusDisplay } from '@/components/blocks/transaction-status/transaction-status';
import { Card, CardContent } from '@/components/ui/card';
import { useTransactionStatus } from '@/hooks/use-transaction-status';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { handleTransaction } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { useQueryState } from 'nuqs';
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
    getTransaction(transactionHash: $transactionHash) {
      metadata
      receipt {
        status
        revertReasonDecoded
        contractAddress
        blockNumber
        logs
      }
    }
  }
`);

/**
 * Handles a token creation transaction
 */
export function handleTokenCreation(transactionState: ReturnType<typeof useTransactionStatus>, hash?: string) {
  return handleTransaction({
    transactionState,
    hash,
    receiptFetcher: async () => {
      if (!hash) {
        return;
      }
      const txresult = await portalClient.request(CreateTokenReceiptQuery, {
        transactionHash: hash,
      });
      return txresult.getTransaction?.receipt;
    },
  });
}

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
        ...createTokenDefaultValues[tokenType],
        ...defaultValues,
      },
    },
    errorMapProps: {},
  });

  const transactionState = useTransactionStatus();

  async function handleSubmit(values: CreateTokenSchemaType) {
    const createTokenResult = await createTokenAction({
      ...values,
    });

    if (createTokenResult?.serverError || createTokenResult?.validationErrors) {
      throw new Error('Error creating token');
    }

    await handleTokenCreation(transactionState, createTokenResult?.data);
  }

  return (
    <div className="TokenizationWizard container mt-8">
      <Card className="w-full pt-10">
        <CardContent>
          {transactionState.status ? (
            <TransactionStatusDisplay
              status={transactionState.status}
              tokenName={form.getValues('tokenName')}
              transactionHash={transactionState.transactionHash}
              error={transactionState.error}
              onClose={() => {
                transactionState.reset();
                resetFormAndAction();
              }}
              onConfirm={() => {
                // Navigate to the token details page
              }}
            />
          ) : (
            <>
              <FormStepProgress steps={3} currentStep={step} complete={false} />
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
                  fields={['tokenName', 'tokenSymbol', 'decimals', 'isin', 'private']}
                  withSheetClose
                  controls={{
                    prev: { buttonText: 'Back' },
                    next: { buttonText: 'Confirm' },
                  }}
                >
                  <TokenBasics form={form} />
                </FormStep>

                {/* Step 2 : Token Configuration */}
                <FormStep
                  form={form}
                  fields={(() => {
                    switch (tokenType) {
                      case 'stablecoin':
                        return ['collateralProofValidityDuration', 'collateralThreshold'];
                      case 'equity':
                        return ['equityClass', 'equityCategory'];
                      case 'bond':
                        return ['faceValueCurrency', 'faceValue', 'maturityDate'];
                      default:
                        return [];
                    }
                  })()}
                  withSheetClose
                  controls={{
                    prev: { buttonText: 'Back' },
                    next: { buttonText: 'Confirm' },
                  }}
                >
                  <TokenConfiguration form={form} tokenType={tokenType} />
                </FormStep>

                {/* Step 3 : Summary */}
                <FormStep
                  form={form}
                  controls={{
                    prev: { buttonText: 'Back' },
                    submit: { buttonText: 'Create stable coin' },
                  }}
                >
                  <Summary form={form} tokenType={tokenType} />
                </FormStep>
              </FormMultiStep>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
