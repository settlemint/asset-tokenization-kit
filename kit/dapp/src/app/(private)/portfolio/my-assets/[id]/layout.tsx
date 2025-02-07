import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { metadata } from '@/lib/config/metadata';
import { ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { getMyAsset } from './_components/data';
import { TransferButton } from './_components/transfer-form/button';
import type { TransferFormAssetType } from './_components/transfer-form/schema';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const myAsset = await getMyAsset(id);

  if (!myAsset) {
    return {
      title: 'Asset not found',
    };
  }

  return {
    title: myAsset.asset.name,
    openGraph: {
      images: [
        {
          url: new URL(`/share/${mapAssetType(myAsset.asset.type)}/${id}/og`, metadata.metadataBase).toString(),
          width: 1280,
          height: 640,
          alt: myAsset.asset.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: new URL(`/share/${mapAssetType(myAsset.asset.type)}/${id}/og`, metadata.metadataBase).toString(),
          width: 1280,
          height: 640,
          alt: myAsset.asset.name,
        },
      ],
    },
  };
}

function mapAssetType(assetType: string) {
  switch (assetType.toLowerCase()) {
    case 'bond':
      return 'bonds';
    case 'stablecoin':
      return 'stablecoins';
    case 'equity':
      return 'equities';
    case 'cryptocurrency':
      return 'cryptocurrencies';
    case 'fund':
      return 'funds';
    default:
      throw new Error(`Unknown asset type: ${assetType}`);
  }
}

export default async function MyAssetDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const myAsset = await getMyAsset(id);

  if (!myAsset) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Asset not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h1 className="flex items-center font-bold text-2xl">
        <span className="mr-2">{myAsset?.asset.name}</span>
        <span className="text-muted-foreground">({myAsset?.asset.symbol})</span>
      </h1>
      <div className="flex justify-between text-muted-foreground text-sm">
        <EvmAddress address={id}>
          <EvmAddressBalances address={id} />
        </EvmAddress>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              Transfer
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <TransferButton
                address={id as Address}
                name={myAsset.asset.name}
                symbol={myAsset.asset.symbol}
                type={myAsset.asset.type as TransferFormAssetType}
                balance={myAsset.valueExact}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="relative mt-4 space-y-2">{children}</div>
    </div>
  );
}
