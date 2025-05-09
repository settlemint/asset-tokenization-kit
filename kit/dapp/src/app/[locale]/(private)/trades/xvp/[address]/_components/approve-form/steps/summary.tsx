import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { authClient } from "@/lib/auth/client";
import type { ApproveXvpInput } from "@/lib/mutations/xvp/approve/approve-schema";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-schema";
import { formatNumber } from "@/lib/utils/number";
import { Coins } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getAddress } from "viem";

interface SummaryProps {
  xvp: XvPSettlement;
}

export function Summary({ xvp }: SummaryProps) {
  const t = useTranslations("trade-management.xvp");
  const session = authClient.useSession();
  const sending = xvp.flows.filter(
    (flow) => getAddress(flow.from.id) === session.data?.user.wallet
  );
  const locale = useLocale();

  return (
    <FormStep title={t("approve")} description={t("approve-description")}>
      {sending.map((flow) => (
        <div key={flow.id}>
          <FormSummaryDetailCard
            icon={<Coins className="size-3 text-primary-foreground" />}
            title={t("asset")}
            description={t("asset-description")}
          >
            <FormSummaryDetailItem
              label={t("asset")}
              value={<EvmAddress address={flow.asset.id} />}
            />
            <FormSummaryDetailItem
              label={t("amount")}
              value={formatNumber(flow.amount, {
                locale,
                decimals: flow.asset.decimals,
                token: flow.asset.symbol,
              })}
            />
            <FormSummaryDetailItem
              label={t("to")}
              value={<EvmAddress address={flow.to.id} />}
            />
          </FormSummaryDetailCard>
        </div>
      ))}
    </FormStep>
  );
}

Summary.validatedFields = [] as (keyof ApproveXvpInput)[];
