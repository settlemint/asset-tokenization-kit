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
      <CardDescription className="mt-2">Provide the general information required to define your token.</CardDescription>
      {/* Name */}
      <TextInput control={form.control} label="Name" name="tokenName" placeholder="e.g., My Stable Coin" showRequired />

      {/* Symbol */}
      <TextInput control={form.control} label="Symbol" name="tokenSymbol" placeholder="e.g., MSC" showRequired />

      {/* Decimals */}
      <NumericInput control={form.control} label="Decimals" name="decimals" placeholder="e.g., MSC" showRequired />

      {/* ISIN */}
      <TextInput control={form.control} label="ISIN" name="isin" placeholder="e.g., US1234567890" />

      <CardTitle className="!mt-16">Stable coin configuration</CardTitle>
      <CardDescription>Set parameters specific to your stable coin.</CardDescription>

      {/* Collateral Proof Validity (Seconds) */}
      <NumericInput
        control={form.control}
        label="Collateral Proof Validity (Seconds)"
        name="collateralProofValidity"
        placeholder="e.g., 3600"
        showRequired
      />

      {/* Token Logo */}
      {/*<FileInput
                control={form.control}
                name="tokenLogo"
                description="This is the logo of the token"
                label="Token Logo"
                text="Click, or drop your logo here"
                multiple={false}
                maxSize={1024 * 1024 * 10} // 10MB
                accept={{
                  'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
                  'text/*': [],
                }}
                server={{
                  bucket: 'default-bucket',
                  storage: 'minio',
                }}
              />*/}
    </div>
  );
};
