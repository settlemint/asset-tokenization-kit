import { DataTable } from "@/components/blocks/data-table/data-table";
import { getContactsList } from "@/lib/queries/contact/contact-list";
import type { Address } from "viem";
import { columns } from "./my-contacts-table-columns";

interface MyContactsTableProps {
  wallet: Address;
  title: string;
}

export default async function MyContactsTable({
  wallet,
  title,
}: MyContactsTableProps) {
  const userContacts = await getContactsList(wallet);

  return <DataTable columns={columns} data={userContacts} name={title} />;
}
