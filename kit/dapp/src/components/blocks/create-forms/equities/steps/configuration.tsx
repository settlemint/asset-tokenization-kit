import { FormStep } from '@/components/blocks/form/form-step';
import { useTranslations } from 'next-intl';
import { EquityCategoriesSelect } from './_components/equity-categories';
import { EquityClassesSelect } from './_components/equity-classes';

export function Configuration() {
  const t = useTranslations('private.assets.create.equities.configuration');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-2 gap-6">
        <EquityClassesSelect label={t('equity-class-label')} />
        <EquityCategoriesSelect label={t('equity-category-label')} />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = [
  'equityCategory',
  'equityClass',
  'managementFeeBps',
] as const;
