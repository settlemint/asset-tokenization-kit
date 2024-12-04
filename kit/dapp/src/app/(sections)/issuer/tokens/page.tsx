import { SidePanel } from '@/components/blocks/sidepanel/sidepanel';
import { Button } from '@/components/ui/button';
import { type SearchParams, createSearchParamsCache, parseAsInteger, parseAsJson, parseAsString } from 'nuqs/server';
import { TokenTable } from './_components/token-table';
import { CreateTokenForm } from './_forms/create-token-form';

const searchParamsCache = createSearchParamsCache({
  currentStep: parseAsInteger.withDefault(1),
  state: parseAsJson((value) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  }),
  formId: parseAsString.withDefault(''),
});

interface IssuerTokensPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function IssuerTokens({ searchParams }: IssuerTokensPageProps) {
  const parsedParams = searchParamsCache.parse(await searchParams);
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Tokens</h2>
        <SidePanel
          title="Create a new token"
          description="Easily convert your assets into digital tokens using this step-by-step wizard."
          trigger={
            <div className="flex items-center space-x-2">
              <Button>Issue new token</Button>
            </div>
          }
        >
          <div className="p-8">
            <CreateTokenForm defaultValues={parsedParams.state} formId={parsedParams.formId || 'create-token-form'} />
          </div>
        </SidePanel>
      </div>
      <TokenTable />
    </>
  );
}
//
