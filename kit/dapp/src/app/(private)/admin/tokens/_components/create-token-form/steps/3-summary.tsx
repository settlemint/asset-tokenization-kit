import {} from '@/components/ui/card';
import { CardDescription, CardTitle } from '@/components/ui/card';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateTokenSchemaType } from '../create-token-form-schema';

export const Summary = ({ form }: { form: UseFormReturn<CreateTokenSchemaType> }) => {
  return (
    <div className="-mt-4">
      {/* Step 3 : Summary */}

      <CardTitle>Summary</CardTitle>
      <CardDescription className="my-2">
        This is the final step before creating your token. Please review all the details you’ve entered
      </CardDescription>
      <div className="mt-6 rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Token Basics</h3>
        <dl className="space-y-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Token Name:</dt>
            <dd className="font-medium">{form.getValues('tokenName')}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Token Symbol:</dt>
            <dd className="font-medium">{form.getValues('tokenSymbol')}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Decimals:</dt>
            <dd className="font-medium">{form.getValues('decimals')}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">ISIN:</dt>
            <dd className="font-medium">{form.getValues('isin')}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <h3 className="mb-4 font-semibold">Token Configuration</h3>
        <dl className="space-y-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Collateral Proof Validity Duration:</dt>
            <dd className="font-medium">{form.getValues('collateralProofValidityDuration')} seconds</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Collateral Threshold:</dt>
            <dd className="font-medium">{form.getValues('collateralThreshold')}%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
