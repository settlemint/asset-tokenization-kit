import { DataTable } from '@/components/blocks/data-table/data-table';
import { getBondList } from '@/lib/queries/bond/bond-list';
import { getCryptoCurrencyList } from '@/lib/queries/cryptocurrency/cryptocurrency-list';
import { getEquityList } from '@/lib/queries/equity/equity-list';
import { getFundList } from '@/lib/queries/fund/fund-list';
import { getStableCoinList } from '@/lib/queries/stablecoin/stablecoin-list';
import { getTokenizedDepositList } from '@/lib/queries/tokenizeddeposit/tokenizeddeposit-list';
import type { AssetType } from '@/lib/utils/zod';
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
    case 'bond':
      return (
        <DataTable
          columns={bondColumns}
          data={await getBondList()}
          name={assettype}
        />
      );
    case 'cryptocurrency':
      return (
        <DataTable
          columns={cryptocurrencyColumns}
          data={await getCryptoCurrencyList()}
          name={assettype}
        />
      );
    case 'stablecoin':
      return (
        <DataTable
          columns={stablecoinColumns}
          data={await getStableCoinList()}
          name={assettype}
        />
      );
    case 'tokenizeddeposit':
      return (
        <DataTable
          columns={tokenizedDepositColumns}
          data={await getTokenizedDepositList()}
          name={assettype}
        />
      );
    case 'equity':
      return (
        <DataTable
          columns={equityColumns}
          data={await getEquityList()}
          name={assettype}
        />
      );
    case 'fund':
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
