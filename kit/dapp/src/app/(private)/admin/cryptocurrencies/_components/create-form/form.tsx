'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCryptoCurrencyFormSchema } from './schema';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';
import { createCryptocurrency } from './store';

export function CreateCryptocurrencyForm() {
  return (
    <AssetForm
      title="Create Cryptocurrency"
      storeAction={createCryptocurrency}
      resolverAction={zodResolver(CreateCryptoCurrencyFormSchema)}
      defaultValues={{
        decimals: 18,
      }}
    >
      <Basics />
      <Configuration />
      <Summary />
    </AssetForm>
  );
}
