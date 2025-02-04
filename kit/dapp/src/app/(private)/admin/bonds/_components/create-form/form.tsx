import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { TokenType } from '@/types/token-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateBondFormSchema } from './schema';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';
import { createBond } from './store';
export function CreateBondForm({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <AssetForm
      storeAction={createBond}
      resolverAction={zodResolver(CreateBondFormSchema)}
      onClose={onClose}
      invalidate={[[TokenType.Bond], ['transactions']]}
    >
      <Basics />
      <Configuration />
      <Summary />
    </AssetForm>
  );
}
