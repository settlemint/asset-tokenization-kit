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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// TypeBox schema for the pincode form
const pincodeSchema = t.Object(
  {
    pincodeName: t.String({ minLength: 1, error: "Name is required" }),
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
      pincodeName: "Default PIN",
      pincode: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pincodeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name-label")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("pincode-label")}</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
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
