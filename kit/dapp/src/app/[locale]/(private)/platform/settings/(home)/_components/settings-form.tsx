"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import { t as tb } from "@/lib/utils/typebox";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateSettings } from "./settings-action";

const schema = tb.Object({
  baseCurrency: tb.FiatCurrency(),
});

const currencyKeys = {
  EUR: "currencies.eur",
  USD: "currencies.usd",
  JPY: "currencies.jpy",
  AED: "currencies.aed",
  SGD: "currencies.sgd",
  SAR: "currencies.sar",
  GBP: "currencies.gbp",
  CHF: "currencies.chf",
} as const;

interface SettingsFormProps {
  defaultBaseCurrency: CurrencyCode;
}

export function SettingsForm({ defaultBaseCurrency }: SettingsFormProps) {
  const t = useTranslations("admin.platform.settings");

  const { form, handleSubmitWithAction } = useHookFormAction(
    updateSettings,
    typeboxResolver(schema),
    {
      formProps: {
        mode: "onSubmit",
        criteriaMode: "all",
        shouldFocusError: false,
        defaultValues: {
          baseCurrency: defaultBaseCurrency,
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success(t("base-currency-updated"));
        },
        onError: (error) => {
          let errorMessage = "Unknown error";

          if (error?.error?.serverError) {
            errorMessage = error.error.serverError as string;
          } else if (error?.error?.validationErrors) {
            errorMessage = "Validation error";
          }

          toast.error(`Failed to submit: ${errorMessage}`);
        },
      },
    }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("base-currency-label")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmitWithAction}>
            <FormField
              name="baseCurrency"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <FormLabel className="text-right">
                    {t("base-currency-label")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("select-base-currency")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fiatCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {t(currencyKeys[currency])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <CardFooter className="p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end">
              <div />
              <Button type="submit" className="translate-x-6 translate-y-4">
                {t("save-changes")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
