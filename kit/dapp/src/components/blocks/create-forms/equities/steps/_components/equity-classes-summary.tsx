import type { equityClasses } from '@/lib/utils/zod';
import { useTranslations } from 'next-intl';

export function EquityClassesSummary({
  value,
}: {
  value: (typeof equityClasses)[number];
}) {
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
    translatedEquityClasses.find((category) => category.value === value)
      ?.label ?? value
  );
}
