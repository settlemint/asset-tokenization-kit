import { TokenTable } from "@/app/wallet/tokens/tables/tokens-table";
import type { BreadcrumbItemType } from "@/components/global/breadcrumb/ellipsis-dropdown";
import { SidePanel } from "@/components/ui/sidepanel";
import { type SearchParams, createSearchParamsCache, parseAsInteger, parseAsJson } from "nuqs/server";
import { CreateTokenForm } from "./forms/create-token-form";

const breadcrumbItems: BreadcrumbItemType[] = [{ label: "Tokens" }];
const searchParamsCache = createSearchParamsCache({ currentStep: parseAsInteger.withDefault(1), state: parseAsJson() });

export default function TokenList({ searchParams }: { searchParams: SearchParams }) {
  const parsedParams = searchParamsCache.parse(searchParams);
  return (
    <div>
      <SidePanel buttonText="Create Token">
        <CreateTokenForm defaultValues={parsedParams.state} />
      </SidePanel>
      <TokenTable />
    </div>
  );
}
