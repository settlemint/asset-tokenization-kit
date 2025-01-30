import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateStablecoinFormSchema } from './schema';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';
import { createStablecoin } from './store';

export function CreateStablecoinForm({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <AssetForm
      revalidateTags={['stablecoins']}
      storeAction={createStablecoin}
      resolverAction={zodResolver(CreateStablecoinFormSchema)}
      onClose={onClose}
    >
      <Basics />
      <Configuration />
      <Summary />
    </AssetForm>
  );
}
