'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import type { Infer, Schema } from 'next-safe-action/adapters/types';
import type { HookSafeActionFn } from 'next-safe-action/hooks';
import type { ReactNode } from 'react';
import { type DefaultValues, FormProvider, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { waitForTransactionMining } from './wait-for-tranaction';

export type AssetFormProps<
  ServerError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE,
  CBAVE,
  // biome-ignore lint/suspicious/noExplicitAny: type coming from react-hook-form
  FormContext = any,
> = {
  children: ReactNode[];
  title: string;
  storeAction: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, string>;
  resolverAction: Resolver<Infer<S>, FormContext>;
  defaultValues: DefaultValues<Infer<S>>;
};

export function AssetForm<
  ServerError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE,
  CBAVE,
  // biome-ignore lint/suspicious/noExplicitAny: type coming from react-hook-form
  FormContext = any,
>({
  children,
  title,
  storeAction,
  resolverAction,
  defaultValues,
}: AssetFormProps<ServerError, S, BAS, CVE, CBAVE, FormContext>) {
  const { form } = useHookFormAction(storeAction, resolverAction, {
    actionProps: {
      onSuccess: (data) => {
        if (data.data) {
          toast.promise(waitForTransactionMining(data.data), {
            loading: `Transaction to create ${data.input.tokenName} (${data.input.tokenSymbol}) waiting to be mined`,
            success: `${data.input.tokenName} (${data.input.tokenSymbol}) created successfully on chain`,
            error: (error) =>
              `Creation of ${data.input.tokenName} (${data.input.tokenSymbol}) failed: ${error.message}`,
          });
        }
      },
      onError: (data) => {
        if (data.error.serverError) {
          let errorMessage = 'Unknown server error';
          if (data.error.serverError instanceof Error) {
            errorMessage = data.error.serverError.message;
          } else if (typeof data.error.serverError === 'string') {
            errorMessage = data.error.serverError;
          }

          toast.error(`Server error: ${errorMessage}. Please try again or contact support if the issue persists.`);
        }

        if (data.error.validationErrors) {
          const errors = Object.entries(data.error.validationErrors)
            .map(([field, error]) => `${field}: ${error}`)
            .join('\n');
          toast.error(`Validation errors:\n${errors}`);
        }
      },
    },
    formProps: {
      defaultValues: defaultValues,
      shouldFocusError: true,
    },
    errorMapProps: {
      joinBy: '\n',
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-2xl">{title}</h2>
      <div className="container mt-8">
        <Card className="w-full pt-10">
          <CardContent>
            <FormProvider {...form}>{children}</FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
