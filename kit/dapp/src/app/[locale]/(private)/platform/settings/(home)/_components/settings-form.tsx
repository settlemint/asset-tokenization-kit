"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Link } from "@/i18n/routing";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import { t as tb } from "@/lib/utils/typebox";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { DollarSign, Users } from "lucide-react";
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
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <DollarSign className="size-4" />
          </div>
          <div>
            <CardTitle>{t("base-currency-title")}</CardTitle>
            <CardDescription>{t("base-currency-description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmitWithAction} className="w-full space-y-4">
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
            <div className="flex justify-end pt-4">
              <Button type="submit">{t("save-changes")}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

interface PermissionsCardProps {
  adminCount: number;
}

export function PermissionsCard({ adminCount }: PermissionsCardProps) {
  const t = useTranslations("admin.platform.settings");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Users className="size-4" />
          </div>
          <div>
            <CardTitle>{t("permissions-title")}</CardTitle>
            <CardDescription>{t("permissions-description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div>
            <div className="flex flex-col gap-4 justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-foreground">
                  {t("admin-count")}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {adminCount}
                </span>
              </div>
              <Link
                className="text-accent hover:underline"
                href="/platform/admins"
              >
                {t("manage-admins")}
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
