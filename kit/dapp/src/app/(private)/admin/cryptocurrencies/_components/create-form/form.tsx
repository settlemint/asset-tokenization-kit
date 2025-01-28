'use client';

import { CreateCryptocurrencySchema } from '@/app/(private)/admin/tokens/_components/create-token-form/create-token-form-schema';
import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCryptocurrency } from './store';

export function CreateCryptocurrencyForm() {
  return (
    <AssetForm
      title="Create Cryptocurrency"
      storeAction={createCryptocurrency}
      resolverAction={zodResolver(CreateCryptocurrencySchema)}
      defaultValues={{
        decimals: 18,
      }}
    >
      <div>Step 1</div>
      <div>Step 2</div>
      <div>Step 3</div>
    </AssetForm>
  );
}
