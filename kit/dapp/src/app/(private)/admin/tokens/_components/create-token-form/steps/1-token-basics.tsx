import { CheckboxInput } from '@/components/blocks/form/controls/checkbox-input';
import { NumericInput } from '@/components/blocks/form/controls/numeric-input';
import { TextInput } from '@/components/blocks/form/controls/text-input';
import { CardDescription, CardTitle } from '@/components/ui/card';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateTokenSchemaType } from '../create-token-form-schema';

export const TokenBasics = ({ form }: { form: UseFormReturn<CreateTokenSchemaType> }) => {
  return (
    <div>
      {/* Step 1 */}

      <CardTitle>Token basics</CardTitle>
      <CardDescription className="my-2">Provide the general information required to define your token.</CardDescription>
      {/* Name */}
      <TextInput control={form.control} label="Name" name="tokenName" placeholder="e.g., My Stable Coin" showRequired />

      {/* Symbol */}
      <TextInput control={form.control} label="Symbol" name="tokenSymbol" placeholder="e.g., MSC" showRequired />

      {/* Decimals */}
      <NumericInput control={form.control} label="Decimals" name="decimals" placeholder="e.g., MSC" showRequired />

      {/* ISIN */}
      <TextInput control={form.control} label="ISIN" name="isin" placeholder="e.g., US1234567890" showRequired />

      {/* Private */}
      <CheckboxInput
        control={form.control}
        label="Private"
        name="private"
        description="Mark your token as private, this means other organisations won’t see it."
      />
    </div>
  );
};
