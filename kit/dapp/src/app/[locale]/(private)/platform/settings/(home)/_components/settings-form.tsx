"use client";

import { Button } from "@/components/ui/button";
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
import { type CurrencyCode, FiatCurrencies } from "@/lib/db/schema-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { updateSettings } from "./settings-action";

const schema = z.object({
  baseCurrency: z.enum(FiatCurrencies),
});

const currencyKeys = {
  EUR: "currencies.eur",
  USD: "currencies.usd",
  JPY: "currencies.jpy",
  AED: "currencies.aed",
  SGD: "currencies.sgd",
  SAR: "currencies.sar",
} as const;

interface SettingsFormProps {
  defaultBaseCurrency: CurrencyCode;
}

export function SettingsForm({ defaultBaseCurrency }: SettingsFormProps) {
  const t = useTranslations("admin.platform.settings");

  const { form, handleSubmitWithAction } = useHookFormAction(
    updateSettings,
    zodResolver(schema),
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
    <Form {...form}>
      <form
        onSubmit={handleSubmitWithAction}
        className="w-full max-w-2xl space-y-4"
      >
        <FormField
          name="baseCurrency"
          render={({ field }) => (
            <FormItem className="grid grid-cols-[200px_1fr] items-center gap-4">
              <FormLabel className="text-right">
                {t("base-currency-label")}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select-base-currency")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FiatCurrencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {t(currencyKeys[currency])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <div className="flex gap-4 pt-4">
          <Button type="submit">{t("save-changes")}</Button>
        </div>
      </form>
    </Form>
  );
}
