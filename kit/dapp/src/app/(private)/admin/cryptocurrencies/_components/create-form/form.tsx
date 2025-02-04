import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { TokenType } from '@/types/token-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCryptoCurrencyFormSchema } from './schema';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';
import { createCryptocurrency } from './store';

export function CreateCryptocurrencyForm({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <AssetForm
      storeAction={createCryptocurrency}
      resolverAction={zodResolver(CreateCryptoCurrencyFormSchema)}
      onClose={onClose}
      invalidate={[[TokenType.Cryptocurrency], ['transactions']]}
    >
      <Basics />
      <Configuration />
      <Summary />
    </AssetForm>
  );
}
