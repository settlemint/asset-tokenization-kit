import { ActionsDropdownTable } from "@/components/blocks/actions-table/actions-dropdown-table";
import { DataTableSkeleton } from "@/components/blocks/data-table/data-table-skeleton";
import { getUser } from "@/lib/auth/utils";
import { getActionsList } from "@/lib/queries/actions/actions-list";
import type { Locale } from "next-intl";
import { Suspense } from "react";
import type { Address } from "viem";

interface PageProps {
  params: Promise<{ locale: Locale; address: Address }>;
}

export default async function ActionsPage({ params }: PageProps) {
  const { address } = await params;
  const user = await getUser();
  const actions = await getActionsList({
    targetAddress: address,
    type: "Admin",
    userAddress: user.wallet,
  });

  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ActionsDropdownTable
        actions={actions}
        toolbar={{
          enableToolbar: false,
        }}
        pagination={{
          enablePagination: false,
        }}
      />
    </Suspense>
  );
}
