import { FormStep } from "@/components/blocks/form/form-step";
import { useTranslations } from "next-intl";

interface SummaryProps {
  configurationCard: React.ReactNode;
}

export function Summary({ configurationCard }: SummaryProps) {
  const t = useTranslations("portfolio.my-airdrops.details.forms.summary");

  return (
    <FormStep title={t("title.claim")} description={t("description.claim")}>
      {configurationCard}
    </FormStep>
  );
}
