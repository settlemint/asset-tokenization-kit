import { CreateTokenWizard } from "@/app/wallet/(home)/forms/create-token-wizard";
import { SidePanel } from "@/components/ui-settlemint/sidepanel-sheet";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { type SearchParams, createSearchParamsCache, parseAsInteger, parseAsJson, parseAsString } from "nuqs/server";
import { v4 as uuidv4 } from "uuid";

const searchParamsCache = createSearchParamsCache({
  currentStep: parseAsInteger.withDefault(1),
  state: parseAsJson(),
  formId: parseAsString.withDefault(""),
});

interface WalletDashboardPageProps {
  searchParams: SearchParams;
}

interface PageParams {
  slug: string;
}

export const generateMetadata = ({ params }: { params: PageParams }): Metadata & { breadcrumbItems: string } => {
  return {
    title: params.slug === "page1" ? "Page 1 SEO Title" : "Page 2 SEO Title",
    abstract: "Abstract for the page",
    breadcrumbItems: JSON.stringify([{ label: "Dashboard", href: "/wallet" }]),
  };
};

export default function WalletDashboardPage({ searchParams }: WalletDashboardPageProps) {
  const parsedParams = searchParamsCache.parse(searchParams);
  return (
    <div className="WalletDashboardPage">
      <SidePanel
        title="Create a new token"
        description="Easily convert your assets into digital tokens using this step-by-step wizard."
        trigger={
          <Button className="absolute right-10" variant="outline">
            Start Wizard
          </Button>
        }
      >
        <CreateTokenWizard defaultValues={parsedParams.state} formId={parsedParams.formId || uuidv4()} />
      </SidePanel>
    </div>
  );
}
