import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { AirdropTransferOwnershipInput } from "@/lib/mutations/airdrop/transfer-ownership/transfer-ownership-schema";
import type { PushAirdrop } from "@/lib/queries/push-airdrop/push-airdrop-schema";
import type { StandardAirdrop } from "@/lib/queries/standard-airdrop/standard-airdrop-schema";
import type { VestingAirdrop } from "@/lib/queries/vesting-airdrop/vesting-airdrop-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface SummaryProps {
  airdrop: PushAirdrop | StandardAirdrop | VestingAirdrop;
}

export function Summary({ airdrop }: SummaryProps) {
  const t = useTranslations("private.airdrops.detail.forms.transfer-ownership");
  const { getValues } = useFormContext<AirdropTransferOwnershipInput>();
  const formValues = getValues();

  return (
    <FormStep title={t("summary-title")} description={t("summary-description")}>
      <FormSummaryDetailItem
        label={t("airdrop-label")}
        value={<EvmAddress address={airdrop.id} prettyNames={true} />}
      />
      <FormSummaryDetailItem
        label={t("new-owner-label")}
        value={<EvmAddress address={formValues.newOwner} prettyNames={true} />}
      />
    </FormStep>
  );
}

type SummaryComponent = typeof Summary & {
  validatedFields: (keyof AirdropTransferOwnershipInput)[];
};

(Summary as SummaryComponent).validatedFields =
  [] satisfies (keyof AirdropTransferOwnershipInput)[];
