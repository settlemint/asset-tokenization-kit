import { TokenTable } from "@/app/wallet/tokens/tables/tokens-table";
import type { BreadcrumbItemType } from "@/components/secure/breadcrumb/ellipsis-dropdown";
import { Main } from "@/components/secure/main";

const breadcrumbItems: BreadcrumbItemType[] = [{ label: "Tokens" }];

export default function TokenList() {
  return (
    <Main breadcrumbItems={breadcrumbItems}>
      <TokenTable />
    </Main>
  );
}
