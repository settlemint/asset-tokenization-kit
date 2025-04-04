import type { StaticDecode } from "@/lib/utils/typebox";
import { t } from "@/lib/utils/typebox";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { TranslatableFormFieldMessage } from "../form/form-field-translatable-message";
import { PincodeInput } from "./pincode-input";

// TypeBox schema for the pincode form
const pincodeSchema = t.Object(
  {
    pincode: t.String({ length: 6, error: "Pincode must be 6 digits" }),
  },
  { $id: "PincodeForm" }
);

export type PincodeFormValues = StaticDecode<typeof pincodeSchema>;

interface PincodeFormProps {
  onSubmit: (data: PincodeFormValues) => Promise<void>;
}

export function PincodeForm({ onSubmit }: PincodeFormProps) {
  const t = useTranslations("private.auth.pincode-form");

  const form = useForm<PincodeFormValues>({
    resolver: typeboxResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("pincode-label")}</FormLabel>
              <FormControl>
                <PincodeInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <TranslatableFormFieldMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? t("setting-up") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
