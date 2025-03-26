import { DataTable } from "@/components/blocks/data-table/data-table";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getBondList } from "@/lib/queries/bond/bond-list";
import { getCryptoCurrencyList } from "@/lib/queries/cryptocurrency/cryptocurrency-list";
import { getDepositList } from "@/lib/queries/deposit/deposit-list";
import { getEquityList } from "@/lib/queries/equity/equity-list";
import { getFundList } from "@/lib/queries/fund/fund-list";
import { getStableCoinList } from "@/lib/queries/stablecoin/stablecoin-list";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { bondColumns } from "./columns/bonds";
import { cryptocurrencyColumns } from "./columns/cryptocurrencies";
import { depositColumns } from "./columns/deposits";
import { equityColumns } from "./columns/equities";
import { fundColumns } from "./columns/funds";
import { stablecoinColumns } from "./columns/stablecoins";

interface TableProps {
  assettype: AssetType;
}

export async function Table({ assettype }: TableProps) {
  const baseCurrency = await getSetting(SETTING_KEYS.BASE_CURRENCY);

  switch (assettype) {
    case "bond":
      return (
        <DataTable
          columns={bondColumns}
          data={await getBondList()}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    case "cryptocurrency":
      return (
        <DataTable
          columns={cryptocurrencyColumns}
          data={await getCryptoCurrencyList()}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    case "stablecoin":
      return (
        <DataTable
          columns={stablecoinColumns}
          data={await getStableCoinList()}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    case "deposit":
      return (
        <DataTable
          columns={depositColumns}
          data={await getDepositList()}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    case "equity":
      return (
        <DataTable
          columns={equityColumns}
          data={await getEquityList()}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    case "fund":
      return (
        <DataTable
          columns={fundColumns}
          data={await getFundList()}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    default:
      throw new Error("Invalid asset type");
  }
}
