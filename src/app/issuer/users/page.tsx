import { CollapsedBreadcrumbSetter } from "@/components/blocks/collapsed-breadcrumb/collapsed-breadcrumb-setter";
import { UsersTable } from "./_components/user-table";

export default function IssuerTokens() {
  return (
    <>
      <CollapsedBreadcrumbSetter
        items={[
          { label: "Issuers", href: "/issuer" },
          { label: "Users", href: "/issuer/users" },
        ]}
      />
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>
      <UsersTable />
    </>
  );
}
