import { AssetFormStep } from '@/components/blocks/asset-form/asset-form-step';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import type { CreateCryptoCurrencyFormType } from '../schema';

export function Basics() {
  const { control } = useFormContext<CreateCryptoCurrencyFormType>();

  return (
    <AssetFormStep title="Basics">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="after:ml-0.5 after:text-red-500 after:content-['\*']">Name</FormLabel>
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
        render={({ field }) => (
          <FormItem>
            <FormLabel className="after:ml-0.5 after:text-red-500 after:content-['\*']">Symbol</FormLabel>
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
        render={({ field }) => (
          <FormItem>
            <FormLabel className="after:ml-0.5 after:text-red-500 after:content-['\*']">Decimals</FormLabel>
            <FormControl>
              <Input placeholder="18" type="number" {...field} />
            </FormControl>
            <FormDescription>This is the number of decimals the asset has.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </AssetFormStep>
  );
}
