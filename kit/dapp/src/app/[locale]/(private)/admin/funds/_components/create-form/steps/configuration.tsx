import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import { FormSelect } from '@/components/blocks/form/inputs/form-select';
import type { CreateFundInput } from '@/lib/mutations/funds/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Configuration() {
  const { control } = useFormContext<CreateFundInput>();
  const t = useTranslations('admin.funds.create-form.configuration');

  // Fund categories sorted alphabetically
  const fundCategories = [
    { value: 'ACTIVIST', label: t('category-activist') },
    { value: 'COMMODITY_TRADING', label: t('category-commodity-trading') },
    {
      value: 'CONVERTIBLE_ARBITRAGE',
      label: t('category-convertible-arbitrage'),
    },
    { value: 'CREDIT', label: t('category-credit') },
    { value: 'CURRENCY_FX', label: t('category-currency-fx') },
    { value: 'DISTRESSED_DEBT', label: t('category-distressed-debt') },
    { value: 'EMERGING_MARKETS', label: t('category-emerging-markets') },
    { value: 'EQUITY_HEDGE', label: t('category-equity-hedge') },
    { value: 'EVENT_DRIVEN', label: t('category-event-driven') },
    {
      value: 'FIXED_INCOME_ARBITRAGE',
      label: t('category-fixed-income-arbitrage'),
    },
    { value: 'FUND_OF_FUNDS', label: t('category-fund-of-funds') },
    { value: 'GLOBAL_MACRO', label: t('category-global-macro') },
    {
      value: 'HIGH_FREQUENCY_TRADING',
      label: t('category-high-frequency-trading'),
    },
    { value: 'MANAGED_FUTURES_CTA', label: t('category-managed-futures-cta') },
    { value: 'MARKET_NEUTRAL', label: t('category-market-neutral') },
    { value: 'MERGER_ARBITRAGE', label: t('category-merger-arbitrage') },
    { value: 'MULTI_STRATEGY', label: t('category-multi-strategy') },
    { value: 'PRIVATE_EQUITY', label: t('category-private-equity') },
    {
      value: 'QUANTITATIVE_SYSTEMATIC',
      label: t('category-quantitative-systematic'),
    },
    { value: 'RELATIVE_VALUE', label: t('category-relative-value') },
    {
      value: 'STATISTICAL_ARBITRAGE',
      label: t('category-statistical-arbitrage'),
    },
    { value: 'STRUCTURED_CREDIT', label: t('category-structured-credit') },
    { value: 'VENTURE_CAPITAL', label: t('category-venture-capital') },
  ].sort((a, b) => a.label.localeCompare(b.label));

  // Fund classes sorted alphabetically
  const fundClasses = [
    { value: 'ABSOLUTE_RETURN', label: t('class-absolute-return') },
    { value: 'CORE_BLEND', label: t('class-core-blend') },
    { value: 'DIVERSIFIED', label: t('class-diversified') },
    { value: 'EARLY_STAGE', label: t('class-early-stage') },
    { value: 'FACTOR_BASED', label: t('class-factor-based') },
    { value: 'GROWTH_FOCUSED', label: t('class-growth-focused') },
    { value: 'INCOME_FOCUSED', label: t('class-income-focused') },
    { value: 'LARGE_CAP', label: t('class-large-cap') },
    { value: 'LONG_EQUITY', label: t('class-long-equity') },
    { value: 'LONG_SHORT_EQUITY', label: t('class-long-short-equity') },
    { value: 'MARKET_NEUTRAL', label: t('class-market-neutral') },
    { value: 'MID_CAP', label: t('class-mid-cap') },
    { value: 'MOMENTUM_ORIENTED', label: t('class-momentum-oriented') },
    { value: 'OPPORTUNISTIC', label: t('class-opportunistic') },
    { value: 'PRE_SERIES_B', label: t('class-pre-series-b') },
    {
      value: 'QUANTITATIVE_ALGORITHMIC',
      label: t('class-quantitative-algorithmic'),
    },
    { value: 'REGIONAL', label: t('class-regional') },
    { value: 'SECTOR_SPECIFIC', label: t('class-sector-specific') },
    { value: 'SEED_PRE_SEED', label: t('class-seed-pre-seed') },
    { value: 'SERIES_B_LATE_STAGE', label: t('class-series-b-late-stage') },
    { value: 'SHORT_EQUITY', label: t('class-short-equity') },
    { value: 'SMALL_CAP', label: t('class-small-cap') },
    {
      value: 'TACTICAL_ASSET_ALLOCATION',
      label: t('class-tactical-asset-allocation'),
    },
    { value: 'VALUE_FOCUSED', label: t('class-value-focused') },
  ].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-2 gap-6">
        <FormSelect
          control={control}
          name="fundCategory"
          label={t('fund-category-label')}
          options={fundCategories}
        />
        <FormSelect
          control={control}
          name="fundClass"
          label={t('fund-class-label')}
          options={fundClasses}
        />
        <FormInput
          control={control}
          type="number"
          name="managementFeeBps"
          label={t('management-fee-label')}
          description={t('management-fee-description')}
          postfix={t('basis-points')}
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = [
  'fundCategory',
  'fundClass',
  'managementFeeBps',
] as const;
