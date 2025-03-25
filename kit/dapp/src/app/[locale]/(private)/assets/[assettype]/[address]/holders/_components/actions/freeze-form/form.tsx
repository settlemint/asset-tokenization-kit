import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { freeze } from "@/lib/mutations/freeze/freeze-action";
import { FreezeSchema } from "@/lib/mutations/freeze/freeze-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Summary } from "./steps/summary";

interface FreezeFormProps {
  address: Address;
  userAddress: Address;
  balance: string | number;
  symbol: string;
  decimals: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assettype: AssetType;
}

export function FreezeForm({
  address,
  userAddress,
  balance,
  symbol,
  decimals,
  open,
  onOpenChange,
  assettype,
}: FreezeFormProps) {
  const t = useTranslations("private.assets.details.forms.form");
  const balanceNum =
    typeof balance === "string" ? Number.parseFloat(balance) : balance;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t("trigger-label.freeze")}
      title={t("title.freeze")}
      description={t("description.freeze")}
    >
      <Form
        action={freeze}
        resolver={typeboxResolver(FreezeSchema())}
        buttonLabels={{
          label: t("trigger-label.freeze"),
        }}
        defaultValues={{
          address,
          userAddress,
          amount: 0,
          assettype,
        }}
        onOpenChange={onOpenChange}
      >
        <Amount balance={balanceNum} symbol={symbol} decimals={decimals} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
