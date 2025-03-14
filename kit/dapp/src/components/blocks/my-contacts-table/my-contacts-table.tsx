import { DataTable } from "@/components/blocks/data-table/data-table";
import { getContactsList } from "@/lib/queries/contact/contact-list";
import { columns } from "./my-contacts-table-columns";

interface MyContactsTableProps {
  wallet: string;
  title: string;
}

export default async function MyContactsTable({
  wallet,
  title,
}: MyContactsTableProps) {
  try {
    const userContacts = await getContactsList(wallet);
    return <DataTable columns={columns} data={userContacts} name={title} />;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return <DataTable columns={columns} data={[]} name={title} />;
  }
}