import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { PushAirdropDistributeInput } from "@/lib/mutations/push-airdrop/push-schema";
import type { PushAirdrop } from "@/lib/queries/push-airdrop/push-airdrop-schema";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
  airdrop: PushAirdrop;
}

function RecipientsTable({ airdrop }: { airdrop: PushAirdrop }) {
  return (
    <Table>
      <TableBody>
        {airdrop.distribution.map((item) => (
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
  return (
    <FormStep
      title="Review and confirm pushing tokens"
      description="Push tokens to airdrop recipients"
    >
      <FormSummaryDetailItem
        label="Airdrop"
        value={<EvmAddress address={airdrop.id} prettyNames={true} />}
      />

      <div className="py-1.5 ">
        <dt className="text-muted-foreground text-sm">Recipients</dt>
        <div className="max-h-[400px] min-h-[100px] overflow-auto mt-2">
          <RecipientsTable airdrop={airdrop} />
        </div>
      </div>
    </FormStep>
  );
}

type SummaryComponent = typeof Summary & {
  validatedFields: (keyof PushAirdropDistributeInput)[];
};

(Summary as SummaryComponent).validatedFields =
  [] satisfies (keyof PushAirdropDistributeInput)[];
