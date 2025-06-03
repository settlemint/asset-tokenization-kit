import { getAirdropRecipientList } from "@/lib/queries/airdrop/airdrop-recipient-list";
import type { Address } from "viem";
import { MyAirdropsClientTable } from "./my-airdrops-client-table";

interface MyAirdropsTableProps {
  wallet: Address;
  title: string;
}

export default async function MyAirdropsTable({
  wallet,
  title,
}: MyAirdropsTableProps) {
  const airdropRecipients = await getAirdropRecipientList(wallet);

  return (
    <MyAirdropsClientTable
      airdropRecipients={airdropRecipients}
      title={title}
    />
  );
}
