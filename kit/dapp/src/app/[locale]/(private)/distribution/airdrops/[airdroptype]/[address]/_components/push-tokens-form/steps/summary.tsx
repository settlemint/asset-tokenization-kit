import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { DistributeInput } from "@/lib/mutations/airdrop/distribute/distribute-schema";
import type { PushAirdrop } from "@/lib/queries/push-airdrop/push-airdrop-schema";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
  airdrop: PushAirdrop;
}

function RecipientsTable({ airdrop }: { airdrop: PushAirdrop }) {
  const recipientsPreview = airdrop.distribution.slice(0, 5);

  return (
    <Table>
      <TableBody>
        {recipientsPreview.map((item) => (
          <TableRow key={item.recipient}>
            <TableCell className="w-4/5">
              <EvmAddress address={item.recipient} prettyNames={true} />
            </TableCell>
            <TableCell className="w-1/5 text-right">
              {item.amount} {airdrop.asset.symbol}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function Summary({ airdrop }: SummaryProps) {
  const t = useTranslations("private.airdrops");
  const { getValues } = useFormContext<DistributeInput>();
  getValues();

  const { totalRecipients, totalAmount } = useMemo(() => {
    const amount = airdrop.distribution.reduce(
      (sum, item) => sum + BigInt(item.amount),
      0n
    );

    return {
      totalRecipients: airdrop.distribution.length,
      totalAmount: amount.toString(),
    };
  }, [airdrop.distribution]);

  return (
    <FormStep
      title={t("detail.forms.distribute.summary.title")}
      description={t("detail.forms.distribute.summary.description")}
    >
      <FormSummaryDetailItem
        label={t("detail.forms.distribute.summary.airdrop")}
        value={<EvmAddress address={airdrop.id} prettyNames={true} />}
      />
      <FormSummaryDetailItem
        label={t("detail.forms.distribute.summary.total-recipients")}
        value={totalRecipients}
      />
      <FormSummaryDetailItem
        label={t("detail.forms.distribute.summary.total-amount")}
        value={`${totalAmount} ${airdrop.asset.symbol}`}
      />

      <div className="py-1.5 ">
        <dt className="text-muted-foreground text-sm">
          {t("detail.forms.distribute.summary.recipients")}
        </dt>
        <div className="max-h-[400px] min-h-[100px] overflow-auto mt-2">
          <RecipientsTable airdrop={airdrop} />
        </div>
        {airdrop.distribution.length > 5 ? (
          <p className="text-sm text-muted-foreground mt-2 text-right">
            {t("create.summary.recipients.and-more", {
              count: airdrop.distribution.length - 5,
            })}
          </p>
        ) : null}
      </div>
    </FormStep>
  );
}

type SummaryComponent = typeof Summary & {
  validatedFields: (keyof DistributeInput)[];
};

(Summary as SummaryComponent).validatedFields =
  [] satisfies (keyof DistributeInput)[];
