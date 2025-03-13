import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { PauseInput } from "@/lib/mutations/equity/pause/pause-schema";
import type { UnPauseInput } from "@/lib/mutations/equity/unpause/unpause-schema";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
  isCurrentlyPaused: boolean;
}

export function Summary({ address, isCurrentlyPaused }: SummaryProps) {
  useFormContext<PauseInput | UnPauseInput>();
  const t = useTranslations("admin.equities.pause-form.summary");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailCard
        title={t("pause-title")}
        description={t("pause-description")}
        icon={<DollarSign className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("asset-label")}
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label={t("current-state-label")}
          value={isCurrentlyPaused ? t("state-paused") : t("state-active")}
        />
        <FormSummaryDetailItem
          label={t("target-state-label")}
          value={isCurrentlyPaused ? t("state-active") : t("state-paused")}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
