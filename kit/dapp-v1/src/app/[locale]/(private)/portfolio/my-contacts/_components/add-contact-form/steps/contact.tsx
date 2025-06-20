import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { AddContactFormType } from "@/lib/mutations/contact/add-contact-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Contact() {
  const { control } = useFormContext<AddContactFormType>();
  const t = useTranslations("portfolio.add-contact-form.contact");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="address"
          label={t("wallet-address-label")}
          placeholder="0x0000000000000000000000000000000000000000"
        />
        <FormInput
          control={control}
          name="firstName"
          label={t("first-name-label")}
          placeholder="John"
        />
        <FormInput
          control={control}
          name="lastName"
          label={t("last-name-label")}
          placeholder="Doe"
        />
      </div>
    </FormStep>
  );
}

Contact.validatedFields = [
  "address",
  "firstName",
  "lastName",
] satisfies (keyof AddContactFormType)[];
