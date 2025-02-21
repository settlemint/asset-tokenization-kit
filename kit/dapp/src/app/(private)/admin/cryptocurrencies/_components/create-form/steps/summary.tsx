import { AssetProperty } from '@/components/blocks/asset-form/asset-property';
import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { DollarSign, Lock, Settings } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { CreateCryptoCurrencyFormType } from '../schema';

export function Summary() {
  const { control } = useFormContext<CreateCryptoCurrencyFormType>();
  const values = useWatch({
    control: control,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-base">Summary</h2>
        <p className="text-muted-foreground text-xs">Review your asset configuration before deployment.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Asset Basics</h3>
              <p className="text-muted-foreground text-xs">Basic asset information and settings.</p>
            </div>
          </div>
          <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">
            <AssetProperty label="Name" value={values.assetName} />
            <AssetProperty label="Symbol" value={values.symbol} />
            <AssetProperty label="Decimals" value={values.decimals} options={{ number: { decimals: 0 } }} />
            <AssetProperty label="Private" value={values.private} />
          </dl>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Settings className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Configuration</h3>
              <p className="text-muted-foreground text-xs">Asset supply and additional settings.</p>
            </div>
          </div>
          <dl className="space-y-2 [&>div:last-child]:border-0 [&>div]:border-b">
            <AssetProperty label="Initial supply" value={values.initialSupply} type="number" />
          </dl>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Security Confirmation</h3>
              <p className="text-muted-foreground text-xs">Enter your pin code to confirm and sign the transaction.</p>
            </div>
          </div>

          <FormField
            control={control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <OTPInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

Summary.validatedFields = ['pincode'] as const;
