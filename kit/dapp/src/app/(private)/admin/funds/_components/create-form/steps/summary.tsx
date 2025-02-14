import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { DollarSign, Lock, Settings } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { CreateFundFormType } from '../schema';

export function Summary() {
  const { control } = useFormContext<CreateFundFormType>();
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
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Name</dt>
              <dd className="font-medium text-sm">{values.assetName}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Symbol</dt>
              <dd className="font-medium text-sm">{values.symbol}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Decimals</dt>
              <dd className="font-medium text-sm">{values.decimals}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">ISIN:</dt>
              <dd className="font-medium">{values.isin === '' ? '-' : values.isin}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground text-sm">Private</dt>
              <dd className="font-medium text-sm">{values.private ? 'Yes' : 'No'}</dd>
            </div>
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
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Fund class:</dt>
              <dd className="font-medium">{values.fundClass}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Fund category:</dt>
              <dd className="font-medium">{values.fundCategory}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted-foreground">Management fee:</dt>
              <dd className="font-medium">{values.managementFeeBps}%</dd>
            </div>
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
