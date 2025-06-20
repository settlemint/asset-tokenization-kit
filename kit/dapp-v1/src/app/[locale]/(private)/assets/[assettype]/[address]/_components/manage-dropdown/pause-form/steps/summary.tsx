import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { PauseInput } from "@/lib/mutations/pause/pause-schema";
import { useTranslations } from "next-intl";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
  isCurrentlyPaused: boolean;
}

export function Summary({ address, isCurrentlyPaused }: SummaryProps) {
  const t = useTranslations("private.assets.details.forms.summary");

  return (
    <FormStep title={t("title.pause")} description={t("description.pause")}>
      <FormSummaryDetailItem
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
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as (keyof PauseInput)[];
