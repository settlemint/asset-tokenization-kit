import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import { authClient } from "@/lib/auth/client";
import {
  DEFAULT_SETTINGS,
  SETTING_KEYS,
  type CurrencyCode,
} from "@/lib/db/schema-settings";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

export function Configuration() {
  const { control } = useFormContext<CreateCryptoCurrencyInput>();
  const { data } = authClient.useSession();
  const t = useTranslations("private.assets.create");
  const currencyOptions = fiatCurrencies.map((currency) => ({
    value: currency,
    label: currency,
  }));
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>(
    DEFAULT_SETTINGS[SETTING_KEYS.BASE_CURRENCY]
  );
  useEffect(() => {
    if (!data?.user) return;
    const setCurrency = async () => {
      const userDetails = await getUserDetail({ id: data.user.id });
      setUserCurrency(userDetails?.currency);
    };
    void setCurrency();
  }, [data?.user]);

  return (
    <FormStep
      title={t("configuration.cryptocurrencies.title")}
      description={t("configuration.cryptocurrencies.description")}
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          name="initialSupply"
          type="number"
          label={t("parameters.cryptocurrencies.initial-supply-label")}
          description={t(
            "parameters.cryptocurrencies.initial-supply-description"
          )}
          required
        />

        <FormInput
          control={control}
          type="number"
          name="price.amount"
          required
          label={t("parameters.common.price-label")}
          postfix={
            <FormSelect
              name="price.currency"
              control={control}
              options={currencyOptions}
              defaultValue={userCurrency}
              className="border-l-0 rounded-l-none w-26 shadow-none -mx-3"
            />
          }
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = [
  "initialSupply",
] satisfies (keyof CreateCryptoCurrencyInput)[];
