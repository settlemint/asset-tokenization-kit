import { AssetFormInput } from '@/components/blocks/asset-form/inputs/asset-form-input';
import { useFormContext } from 'react-hook-form';
import type { AddContactFormType } from '../schema';

export function Contact() {
  const { control } = useFormContext<AddContactFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Add Contact</h2>
          <p className="text-muted-foreground text-sm">
            Quickly save recipient details to your contacts for future transfers.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <AssetFormInput
          control={control}
          name="address"
          label="Wallet Address"
          placeholder="0x0000000000000000000000000000000000000000"
        />
        <AssetFormInput control={control} name="firstName" label="First Name" placeholder="John" />
        <AssetFormInput control={control} name="lastName" label="Last Name" placeholder="Doe" />
      </div>
    </div>
  );
}

Contact.validatedFields = ['address'] as const;
