'use client';

import { SidePanel } from '@/components/blocks/sidepanel/sidepanel';
import { TokenCharts } from '@/components/token-charts/token-charts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import type { Address } from 'viem';
import { useTokenDetails } from '../_queries/token-details';
import { MintTokenForm } from './_forms/mint-token-form';

// TODO: Add pie charts for the distribution of the token

type ContractData = NonNullable<ReturnType<typeof useTokenDetails>['data']>['erc20Contract'];

const formatLabel = (key: string): string => {
  const words = key.split(/(?=[A-Z])/).map((word) => word.toLowerCase());
  return words.map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)).join(' ');
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (Array.isArray(value)) {
    return `${(value ?? []).length}`;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

export default function WalletTokenDetailsPage() {
  const params = useParams();
  const address = params.address as string;
  const { data } = useTokenDetails(address);

  const contract = data?.erc20Contract;

  if (!contract) {
    return <div>No contract data available</div>;
  }

  type ContractDataValue = ContractData[keyof ContractData];
  const fields = Object.entries(contract) as [keyof ContractData, ContractDataValue][];

  return (
    <>
      <SidePanel
        title="Mint new tokens"
        description="Generate and distribute your digital tokens to your token holders."
        trigger={
          <div className="fixed top-24 right-8 flex items-center space-x-2">
            <Button>Mint tokens</Button>
          </div>
        }
      >
        <div className="p-8">
          <MintTokenForm defaultValues={{ tokenAddress: address as Address }} formId="mint-token-form" />
        </div>
      </SidePanel>
      <h3 className="font-semibold text-lg text-primary">Token Details</h3>
      <Card className="p-4">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {fields
            .filter(([key]) => !['id', 'name', 'balances', 'transfers'].includes(key))
            .map(([key, value]) => (
              <div key={key}>
                <dt className="font-medium text-muted-foreground text-sm">{formatLabel(key)}</dt>
                <dd className="mt-1 text-sm">{formatValue(value)}</dd>
              </div>
            ))}
        </dl>
      </Card>
      <TokenCharts token={address} />
    </>
  );
}
