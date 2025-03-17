import { FormSelect } from '@/components/blocks/form/inputs/form-select';
import type { CreateEquityInput } from '@/lib/mutations/equity/create/create-schema';
import type { equityClasses } from '@/lib/utils/zod';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function EquityClassesSelect({ label }: { label: string }) {
  const { control } = useFormContext<CreateEquityInput>();
  const t = useTranslations('private.assets.fields');

  const translatedEquityClasses: {
    value: (typeof equityClasses)[number];
    label: string;
  }[] = [
    {
      value: 'COMMON_EQUITY',
      label: t('equity.classes.common-equity'),
    },
    {
      value: 'PREFERRED_EQUITY',
      label: t('equity.classes.preferred-equity'),
    },
    {
      value: 'MARKET_CAPITALIZATION_EQUITY',
      label: t('equity.classes.market-capitalization-equity'),
    },
    {
      value: 'GEOGRAPHIC_EQUITY',
      label: t('equity.classes.geographic-equity'),
    },
    {
      value: 'SECTOR_INDUSTRY_EQUITY',
      label: t('equity.classes.sector-industry-equity'),
    },
    {
      value: 'INVESTMENT_STYLE_EQUITY',
      label: t('equity.classes.investment-style-equity'),
    },
    {
      value: 'INVESTMENT_STAGE_PRIVATE_EQUITY',
      label: t('equity.classes.investment-stage-private-equity'),
    },
    {
      value: 'SPECIAL_CLASSES_EQUITY',
      label: t('equity.classes.special-classes-equity'),
    },
  ];

  return (
    <FormSelect
      control={control}
      name="equityClass"
      label={label}
      options={translatedEquityClasses.sort((a, b) =>
        a.label.localeCompare(b.label)
      )}
      required
    />
  );
}
