import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { TokenType } from '@/types/token-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { BurnStablecoinFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recepients';
import { Summary } from './steps/summary';
import { burnStablecoin } from './store';

export function BurnStablecoinForm({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <AssetForm
      invalidate={[[TokenType.Stablecoin], ['transactions']]}
      storeAction={burnStablecoin}
      resolverAction={zodResolver(BurnStablecoinFormSchema)}
      onClose={onClose}
      submitLabel="Burn Asset"
    >
      <Recipients />
      <Amount />
      <Summary />
    </AssetForm>
  );
}
