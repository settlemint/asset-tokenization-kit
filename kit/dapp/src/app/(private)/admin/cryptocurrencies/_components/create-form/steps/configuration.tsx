import { AssetFormStep } from '@/components/blocks/asset-form/asset-form-step';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import type { CreateCryptoCurrencyFormType } from '../schema';

export function Configuration() {
  const { control } = useFormContext<CreateCryptoCurrencyFormType>();

  return (
    <AssetFormStep title="Configuration">
      <FormField
        control={control}
        name="initialSupply"
        defaultValue={0}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="after:ml-0.5 after:text-red-500 after:content-['\*']">Initial supply</FormLabel>
            <FormControl>
              <Input placeholder="18" type="number" {...field} />
            </FormControl>
            <FormDescription>This is the initial supply of the asset allocated to the issuer.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </AssetFormStep>
  );
}
