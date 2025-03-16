import { DataTable } from '@/components/blocks/data-table/data-table';
import { getBondList } from '@/lib/queries/bond/bond-list';
import { getCryptoCurrencyList } from '@/lib/queries/cryptocurrency/cryptocurrency-list';
import { getEquityList } from '@/lib/queries/equity/equity-list';
import { getFundList } from '@/lib/queries/fund/fund-list';
import { getStableCoinList } from '@/lib/queries/stablecoin/stablecoin-list';
import { getTokenizedDepositList } from '@/lib/queries/tokenizeddeposit/tokenizeddeposit-list';
import type { AssetType } from '../../types';
import { bondColumns } from './columns/bonds';
import { cryptocurrencyColumns } from './columns/cryptocurrencies';
import { equityColumns } from './columns/equities';
import { fundColumns } from './columns/funds';
import { stablecoinColumns } from './columns/stablecoins';
import { tokenizedDepositColumns } from './columns/tokenizeddeposits';

interface TableProps {
  assettype: AssetType;
}

export async function Table({ assettype }: TableProps) {
  switch (assettype) {
    case 'bonds':
      return (
        <DataTable
          columns={bondColumns}
          data={await getBondList()}
          name={assettype}
        />
      );
    case 'cryptocurrencies':
      return (
        <DataTable
          columns={cryptocurrencyColumns}
          data={await getCryptoCurrencyList()}
          name={assettype}
        />
      );
    case 'stablecoins':
      return (
        <DataTable
          columns={stablecoinColumns}
          data={await getStableCoinList()}
          name={assettype}
        />
      );
    case 'tokenizeddeposits':
      return (
        <DataTable
          columns={tokenizedDepositColumns}
          data={await getTokenizedDepositList()}
          name={assettype}
        />
      );
    case 'equities':
      return (
        <DataTable
          columns={equityColumns}
          data={await getEquityList()}
          name={assettype}
        />
      );
    case 'funds':
      return (
        <DataTable
          columns={fundColumns}
          data={await getFundList()}
          name={assettype}
        />
      );
    default:
      throw new Error(`Invalid asset type: ${assettype}`);
  }
}
