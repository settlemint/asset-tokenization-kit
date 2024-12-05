import { SidePanel } from '@/components/blocks/sidepanel/sidepanel';
import { Button } from '@/components/ui/button';
import { TokenTable } from './_components/token-table';
import { CreateTokenForm } from './_forms/create-token-form';

export default function IssuerTokens() {
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
            <CreateTokenForm formId="create-token-form" />
          </div>
        </SidePanel>
      </div>
      <TokenTable />
    </>
  );
}
//
