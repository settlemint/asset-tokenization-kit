import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { DistributeInput } from "@/lib/mutations/airdrop/distribute/distribute-schema";
import type { PushAirdrop } from "@/lib/queries/push-airdrop/push-airdrop-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
  airdrop: PushAirdrop;
}

function RecipientsTable({
  airdrop,
  recipient,
}: {
  airdrop: PushAirdrop;
  recipient: Address;
}) {
  return (
    <Table>
      <TableBody>
        {airdrop.distribution
          .filter((item) => item.recipient === recipient)
          .map((item) => (
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
  const t = useTranslations("private.airdrops.detail.forms.distribute.summary");
  const { getValues } = useFormContext<DistributeInput>();
  const formValues = getValues();

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailItem
        label={t("airdrop")}
        value={<EvmAddress address={airdrop.id} prettyNames={true} />}
      />

      <div className="py-1.5 ">
        <dt className="text-muted-foreground text-sm">{t("recipients")}</dt>
        <div className="max-h-[400px] min-h-[100px] overflow-auto mt-2">
          <RecipientsTable airdrop={airdrop} recipient={formValues.recipient} />
        </div>
      </div>
    </FormStep>
  );
}

type SummaryComponent = typeof Summary & {
  validatedFields: (keyof DistributeInput)[];
};

(Summary as SummaryComponent).validatedFields =
  [] satisfies (keyof DistributeInput)[];
