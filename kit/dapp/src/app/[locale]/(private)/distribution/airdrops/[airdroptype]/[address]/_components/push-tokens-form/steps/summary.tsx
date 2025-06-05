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
  airdrop.distribution = [
    {
      index: 0,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 1,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 2,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 3,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 4,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 5,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 6,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 7,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 8,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 9,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 10,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 11,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
    {
      index: 12,
      recipient: "0x0000000000000000000000000000000000000001",
      amount: 100,
    },
  ];

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
