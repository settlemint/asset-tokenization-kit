import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import type { CreateStablecoinFormType } from '../schema';

export function Configuration() {
  const { control } = useFormContext<CreateStablecoinFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Configuration</h2>
          <p className="text-muted-foreground text-sm">Set parameters specific to your stable coin.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={control}
          name="collateralThreshold"
          defaultValue={0}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collateral threshold</FormLabel>
              <FormControl>
                <div className="flex rounded-lg shadow-black/5 shadow-sm">
                  <Input
                    className="-me-px rounded-e-none shadow-none focus:mr-[1px]"
                    placeholder="e.g., 100"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                    required
                    min={0}
                    max={100}
                    step={1}
                  />
                  <span className="inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="collateralProofValidityDuration"
          defaultValue={30 * 24 * 60 * 60}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collateral Proof Validity duration</FormLabel>
              <FormControl>
                <div className="flex rounded-lg shadow-black/5 shadow-sm">
                  <Input
                    className="-me-px rounded-e-none shadow-none focus:mr-[1px]"
                    placeholder="e.g., 3600"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                    required
                    min={0}
                    max={100}
                    step={1}
                  />
                  <span className="inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-muted-foreground text-sm">
                    seconds
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

Configuration.validatedFields = ['collateralThreshold', 'collateralProofValidityDuration'] as const;
