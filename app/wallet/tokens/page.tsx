import type { BreadcrumbItemType } from "@/components/global/breadcrumb/ellipsis-dropdown";
import { Button } from "@/components/ui/button";
import { SidePanel } from "@/components/ui/sidepanel-sheet";
import { type SearchParams, createSearchParamsCache, parseAsInteger, parseAsJson, parseAsString } from "nuqs/server";
import { CreateTokenForm } from "./forms/create-token-form";
import { TokenTable } from "./tables/tokens-table";

const searchParamsCache = createSearchParamsCache({
  currentStep: parseAsInteger.withDefault(1),
  state: parseAsJson(),
  formId: parseAsString.withDefault(""),
});

const breadcrumbItems: BreadcrumbItemType[] = [{ label: "Tokens" }];

interface WalletTokenPageProps {
  searchParams: SearchParams;
}

export default function WalletTokenPage({ searchParams }: WalletTokenPageProps) {
  const parsedParams = searchParamsCache.parse(searchParams);
  return (
    <div className="WalletTokenPage">
      <SidePanel
        title="Create a new token"
        description="Easily convert your assets into digital tokens using this step-by-step wizard."
        trigger={
          <Button className="absolute right-8" variant="outline">
            Create new token
          </Button>
        }
      >
        <CreateTokenForm defaultValues={parsedParams.state} />
      </SidePanel>
      <div className="mt-10">
        <TokenTable />
      </div>
    </div>
  );
}
