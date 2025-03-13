import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { BlockUserInput } from "@/lib/mutations/fund/block-user/block-user-schema";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
  isCurrentlyBlocked: boolean;
}

export function Summary({ address, isCurrentlyBlocked }: SummaryProps) {
  const { control } = useFormContext<BlockUserInput>();
  const t = useTranslations("admin.asset-holders-tab.block-form.summary");

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailCard
        title={isCurrentlyBlocked ? t("unblock-title") : t("block-title")}
        description={t("operation-description")}
        icon={<DollarSign className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("asset-label")}
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label={t("current-state-label")}
          value={isCurrentlyBlocked ? t("state-blocked") : t("state-active")}
        />
        <FormSummaryDetailItem
          label={t("target-state-label")}
          value={isCurrentlyBlocked ? t("state-active") : t("state-blocked")}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
