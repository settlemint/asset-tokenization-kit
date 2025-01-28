import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';
import type { CreateCryptoCurrencyFormType } from '../schema';

export function Basics() {
  const { control } = useFormContext<CreateCryptoCurrencyFormType>();

  return (
    <div>
      <FormField
        control={control}
        name="assetName"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Bitcoin" {...field} />
            </FormControl>
            <FormDescription>This is the name of the asset.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="symbol"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <FormLabel>Symbol</FormLabel>
            <FormControl>
              <Input placeholder="BTC" {...field} />
            </FormControl>
            <FormDescription>This is the symbol of the asset.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="decimals"
        defaultValue={18}
        render={({ field: { value, onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Decimals</FormLabel>
            <FormControl>
              <Input
                placeholder="18"
                type="number"
                autoComplete="off"
                data-form-type="other"
                value={value ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  onChange(val);
                }}
                {...field}
              />
            </FormControl>
            <FormDescription>This is the number of decimals the asset has.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="private"
        defaultValue={true}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <FormLabel className="text-base">
              Mark your token as private, this means other organisations won't see it.
            </FormLabel>
            <FormControl>
              <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

Basics.validatedFields = ['assetName', 'symbol', 'decimals', 'private'] as const;
