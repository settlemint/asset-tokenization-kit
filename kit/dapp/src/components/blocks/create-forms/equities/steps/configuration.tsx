import { FormStep } from '@/components/blocks/form/form-step';
import { useTranslations } from 'next-intl';
import { EquityCategoriesSelect } from './_components/equity-categories';
import { EquityClassesSelect } from './_components/equity-classes';

export function Configuration() {
  const t = useTranslations('private.assets.create');

  return (
    <FormStep
      title={t('configuration.equities.title')}
      description={t('configuration.equities.description')}
    >
      <div className="grid grid-cols-2 gap-6">
        <EquityClassesSelect
          label={t('parameters.equities.equity-class-label')}
        />
        <EquityCategoriesSelect
          label={t('parameters.equities.equity-category-label')}
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = [
  'equityCategory',
  'equityClass',
  'managementFeeBps',
] as const;
