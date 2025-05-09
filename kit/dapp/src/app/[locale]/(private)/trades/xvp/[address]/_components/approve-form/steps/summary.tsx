import { FormStep } from "@/components/blocks/form/form-step";
import type { ApproveXvpInput } from "@/lib/mutations/xvp/approve/approve-schema";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-schema";
import { useTranslations } from "next-intl";

interface SummaryProps {
  xvp: XvPSettlement;
}

export function Summary({ xvp }: SummaryProps) {
  const t = useTranslations("trade-management.xvp");

  return (
    <FormStep title={t("approve")} description={t("approve-description")}>
      {/* <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={address} />}
      />
      <FormSummaryDetailItem
        label={t("current-state-label")}
        value={isCurrentlyPaused ? t("paused-label") : t("active-label")}
      />
      <FormSummaryDetailItem
        label={t("target-state-label")}
        value={isCurrentlyPaused ? t("active-label") : t("paused-label")}
      /> */}
    </FormStep>
  );
}

Summary.validatedFields = [] as (keyof ApproveXvpInput)[];
