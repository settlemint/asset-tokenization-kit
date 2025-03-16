import { FormSelect } from '@/components/blocks/form/inputs/form-select';
import type { CreateEquityInput } from '@/lib/mutations/equity/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function EquityCategoriesSelect({ label }: { label: string }) {
  const { control } = useFormContext<CreateEquityInput>();
  const t = useTranslations('private.assets.fields');

  const translatedEquityCategories = [
    {
      value: 'COMMON_EQUITY',
      label: t('equity.categories.common-equity'),
    },
    {
      value: 'VOTING_COMMON_STOCK',
      label: t('equity.categories.voting-common-stock'),
    },
    {
      value: 'NON_VOTING_COMMON_STOCK',
      label: t('equity.categories.non-voting-common-stock'),
    },
    {
      value: 'CUMULATIVE_PREFERRED_STOCK',
      label: t('equity.categories.cumulative-preferred-stock'),
    },
    {
      value: 'NON_CUMULATIVE_PREFERRED_STOCK',
      label: t('equity.categories.non-cumulative-preferred-stock'),
    },
    {
      value: 'CONVERTIBLE_PREFERRED_STOCK',
      label: t('equity.categories.convertible-preferred-stock'),
    },
    {
      value: 'REDEEMABLE_PREFERRED_STOCK',
      label: t('equity.categories.redeemable-preferred-stock'),
    },
    {
      value: 'LARGE_CAP_EQUITY',
      label: t('equity.categories.large-cap-equity'),
    },
    {
      value: 'MID_CAP_EQUITY',
      label: t('equity.categories.mid-cap-equity'),
    },
    {
      value: 'SMALL_CAP_EQUITY',
      label: t('equity.categories.small-cap-equity'),
    },
    {
      value: 'MICRO_CAP_EQUITY',
      label: t('equity.categories.micro-cap-equity'),
    },
    {
      value: 'DOMESTIC_EQUITY',
      label: t('equity.categories.domestic-equity'),
    },
    {
      value: 'INTERNATIONAL_EQUITY',
      label: t('equity.categories.international-equity'),
    },
    {
      value: 'GLOBAL_EQUITY',
      label: t('equity.categories.global-equity'),
    },
    {
      value: 'FRONTIER_MARKET_EQUITY',
      label: t('equity.categories.frontier-market-equity'),
    },
    {
      value: 'TECHNOLOGY',
      label: t('equity.categories.technology'),
    },
    {
      value: 'FINANCIALS',
      label: t('equity.categories.financials'),
    },
    {
      value: 'HEALTHCARE',
      label: t('equity.categories.healthcare'),
    },
    {
      value: 'ENERGY',
      label: t('equity.categories.energy'),
    },
    {
      value: 'CONSUMER_STAPLES',
      label: t('equity.categories.consumer-staples'),
    },
    {
      value: 'CONSUMER_DISCRETIONARY',
      label: t('equity.categories.consumer-discretionary'),
    },
    {
      value: 'INDUSTRIALS',
      label: t('equity.categories.industrials'),
    },
    {
      value: 'MATERIALS',
      label: t('equity.categories.materials'),
    },
    {
      value: 'UTILITIES',
      label: t('equity.categories.utilities'),
    },
    {
      value: 'COMMUNICATION_SERVICES',
      label: t('equity.categories.communication-services'),
    },
    {
      value: 'REAL_ESTATE',
      label: t('equity.categories.real-estate'),
    },
    {
      value: 'GROWTH_EQUITY',
      label: t('equity.categories.growth-equity'),
    },
    {
      value: 'VALUE_EQUITY',
      label: t('equity.categories.value-equity'),
    },
    {
      value: 'BLEND_EQUITY',
      label: t('equity.categories.blend-equity'),
    },
    {
      value: 'GROWTH_CAPITAL',
      label: t('equity.categories.growth-capital'),
    },
    {
      value: 'LEVERAGED_BUYOUTS',
      label: t('equity.categories.leveraged-buyouts'),
    },
    {
      value: 'MEZZANINE_FINANCING',
      label: t('equity.categories.mezzanine-financing'),
    },
    {
      value: 'ESOP_SHARES',
      label: t('equity.categories.esop-shares'),
    },
    {
      value: 'TRACKING_STOCKS',
      label: t('equity.categories.tracking-stocks'),
    },
    {
      value: 'DUAL_CLASS_SHARES',
      label: t('equity.categories.dual-class-shares'),
    },
  ];

  return (
    <FormSelect
      control={control}
      name="equityCategory"
      label={label}
      options={translatedEquityCategories}
      required
    />
  );
}
