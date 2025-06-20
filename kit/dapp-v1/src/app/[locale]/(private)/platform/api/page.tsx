import { DataTable } from "@/components/blocks/data-table/data-table";
import { auth } from "@/lib/auth/auth";
import { getUser } from "@/lib/auth/utils";
import { headers } from "next/headers";
import { Columns, icons } from "./_components/api-key-columns";

export default async function ApiKeysPage() {
  const user = await getUser();
  const apiKeys = await auth.api.listApiKeys({
    headers: await headers(),
    query: {
      userId: user.id,
    },
  });

  return (
    <DataTable
      columns={Columns}
      data={apiKeys}
      icons={icons}
      name={"api-keys"}
    />
  );
}
