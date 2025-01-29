import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';
import type { CreateBondFormType } from '../schema';

export function Basics() {
  const { control } = useFormContext<CreateBondFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Basic Information</h2>
          <p className="text-muted-foreground text-sm">Configure the basic properties of your asset.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={control}
          name="assetName"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., My Bond"
                  {...field}
                  required
                  minLength={2}
                  maxLength={50}
                  pattern="^[a-zA-Z0-9\s-]+$"
                />
              </FormControl>
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
                <Input placeholder="e.g., MYB" {...field} required minLength={2} maxLength={11} pattern="^[A-Z0-9]+$" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="decimals"
          defaultValue={2}
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Decimals</FormLabel>
              <FormControl>
                <Input
                  placeholder="2"
                  type="number"
                  autoComplete="off"
                  data-form-type="other"
                  value={value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    onChange(val);
                  }}
                  {...field}
                  required
                  min={0}
                  max={18}
                  step={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="isin"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISIN</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., US1234567890"
                  {...field}
                  required
                  minLength={2}
                  maxLength={50}
                  pattern="^[a-zA-Z0-9\s-]+$"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="private"
        defaultValue={true}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Private Token</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                <span className="text-muted-foreground text-sm">Other organisations won&apos;t see this asset</span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

Basics.validatedFields = ['assetName', 'symbol', 'decimals', 'private', 'isin'] as const;
