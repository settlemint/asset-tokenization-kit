import { FormStep } from "@/components/blocks/form/form-step";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { CreateDvpSwapInput } from "@/lib/mutations/dvp/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function User() {
  const t = useTranslations("trade-management.forms.user");
  const { control } = useFormContext<CreateDvpSwapInput>();

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-6"
    >
      <FormUsers
        control={control}
        name="user"
        label={t("user")}
        placeholder={t("user")}
        required
      />
    </FormStep>
  );
}

User.validatedFields = ["user"] as (keyof CreateDvpSwapInput)[];
