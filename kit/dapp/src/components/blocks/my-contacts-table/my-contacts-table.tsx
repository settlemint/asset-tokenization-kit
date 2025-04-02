import { DataTable } from "@/components/blocks/data-table/data-table";
import { getUser } from "@/lib/auth/utils";
import { getContactsList } from "@/lib/queries/contact/contact-list";
import { Columns } from "./my-contacts-table-columns";

interface MyContactsTableProps {
  title: string;
}

export default async function MyContactsTable({ title }: MyContactsTableProps) {
  try {
    const user = await getUser();
    const userContacts = await getContactsList(user.id);
    return <DataTable columns={Columns} data={userContacts} name={title} />;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return <DataTable columns={Columns} data={[]} name={title} />;
  }
}
