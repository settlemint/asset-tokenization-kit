import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import type { CreateEquityFormType } from '../schema';

export function Configuration() {
  const { control } = useFormContext<CreateEquityFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Configuration</h2>
          <p className="text-muted-foreground text-sm">Set parameters specific to your equity.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={control}
          name="equityClass"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equity class</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Common"
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
          name="equityCategory"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equity category</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Series A"
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
    </div>
  );
}

Configuration.validatedFields = ['equityClass', 'equityCategory'] as const;
