import { FormStep } from "@/components/blocks/form/form-step";
import { FormUsers } from "@/components/blocks/form/inputs/form-users";
import type { CreateDvpSwapInput } from "@/lib/mutations/dvp/create/create-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Participants() {
  const t = useTranslations("trade-management.forms.participants");
  const { control } = useFormContext<CreateDvpSwapInput>();

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-6"
    >
      <FormUsers
        control={control}
        name="receiver"
        label={t("receiver")}
        placeholder={t("receiver")}
        required
      />
      <FormUsers
        control={control}
        name="sender"
        label={t("sender")}
        placeholder={t("sender")}
        required
        disabled
      />
    </FormStep>
  );
}

Participants.validatedFields = [
  "sender",
  "receiver",
] as (keyof CreateDvpSwapInput)[];
