import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import type { CreateCryptoCurrencyFormType } from '../schema';

export function Configuration() {
  const { control } = useFormContext<CreateCryptoCurrencyFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Configuration</h2>
          <p className="text-muted-foreground text-sm">Configure the supply and distribution of your asset.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={control}
          name="initialSupply"
          defaultValue={0}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial supply</FormLabel>
              <FormControl>
                <Input
                  placeholder="1000000"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                  required
                  min={0}
                  max={1000000000000}
                  step={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

Configuration.validatedFields = ['initialSupply'] as const;
