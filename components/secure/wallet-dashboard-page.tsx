import { CreateTokenWizard } from "@/components/features/create-token-wizard";
import { SidePanel } from "@/components/ui/sidepanel";
import { type SearchParams, createSearchParamsCache, parseAsInteger, parseAsJson, parseAsString } from "nuqs/server";
import type { PropsWithChildren } from "react";
import { v4 as uuidv4 } from "uuid";

const searchParamsCache = createSearchParamsCache({
  currentStep: parseAsInteger.withDefault(1),
  state: parseAsJson(),
  formId: parseAsString.withDefault(""),
});

interface WalletDashboardPageProps {
  searchParams: SearchParams;
}

export function WalletDashboardPage({ searchParams, children }: PropsWithChildren<WalletDashboardPageProps>) {
  const parsedParams = searchParamsCache.parse(searchParams);
  return (
    <div className="WalletDashboardPage">
      <div>{JSON.stringify(process.env.SETTLEMINT_CONFIG)}</div>
      <SidePanel buttonText="Start Wizard">
        <CreateTokenWizard defaultValues={parsedParams.state} formId={parsedParams.formId || uuidv4()} />
      </SidePanel>
    </div>
  );
}
