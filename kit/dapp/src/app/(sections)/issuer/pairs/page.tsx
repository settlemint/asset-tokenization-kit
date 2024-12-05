import { SidePanel } from '@/components/blocks/sidepanel/sidepanel';
import { Button } from '@/components/ui/button';
import { PairTable } from './_components/pair-table';
import { CreatePairForm } from './_forms/create-pair-form';

export default function IssuerTokens() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Trading Pairs</h2>
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
            <CreatePairForm formId="create-pair-form" />
          </div>
        </SidePanel>
      </div>
      <PairTable />
    </>
  );
}
