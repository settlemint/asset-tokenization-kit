import { SidePanel } from "@/components/blocks/sidepanel/sidepanel";
import { Button } from "@/components/ui/button";
import { type SearchParams, createSearchParamsCache, parseAsInteger, parseAsJson, parseAsString } from "nuqs/server";
import { PairTable } from "./_components/pair-table";
import { CreatePairForm } from "./_forms/create-pair-form";

const searchParamsCache = createSearchParamsCache({
  currentStep: parseAsInteger.withDefault(1),
  state: parseAsJson((value) => {
    if (typeof value === "string") {
      return JSON.parse(value);
    }
    return value;
  }),
  formId: parseAsString.withDefault(""),
});

interface IssuerTokensPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function IssuerTokens({ searchParams }: IssuerTokensPageProps) {
  const parsedParams = searchParamsCache.parse(await searchParams);
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tokens</h2>
        <SidePanel
          title="Create a new pair"
          description="Create a new token pair to trade between two tokens."
          trigger={
            <div className="flex items-center space-x-2">
              <Button>Create new pair</Button>
            </div>
          }
        >
          <div className="p-8">
            <CreatePairForm defaultValues={parsedParams.state} formId={parsedParams.formId || "create-pair-form"} />
          </div>
        </SidePanel>
      </div>
      <PairTable />
    </>
  );
}
