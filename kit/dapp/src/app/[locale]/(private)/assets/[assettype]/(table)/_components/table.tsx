import { DataTable } from "@/components/blocks/data-table/data-table";
import { getUser } from "@/lib/auth/utils";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getBondList } from "@/lib/queries/bond/bond-list";
import { getCryptoCurrencyList } from "@/lib/queries/cryptocurrency/cryptocurrency-list";
import { getDepositList } from "@/lib/queries/deposit/deposit-list";
import { getEquityList } from "@/lib/queries/equity/equity-list";
import { getFundList } from "@/lib/queries/fund/fund-list";
import { getStableCoinList } from "@/lib/queries/stablecoin/stablecoin-list";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { BondColumns } from "./columns/bonds";
import { CryptocurrencyColumns } from "./columns/cryptocurrencies";
import { DepositColumns } from "./columns/deposits";
import { EquityColumns } from "./columns/equities";
import { FundColumns } from "./columns/funds";
import { StablecoinColumns } from "./columns/stablecoins";

interface TableProps {
  assettype: AssetType;
}

export async function AssetsTable({ assettype }: TableProps) {
  const baseCurrency = await getSetting(SETTING_KEYS.BASE_CURRENCY);
  const user = await getUser();
  switch (assettype) {
    case "bond":
      return (
        <DataTable
          columns={BondColumns}
          data={await getBondList(user.currency)}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    case "cryptocurrency":
      return (
        <DataTable
          columns={CryptocurrencyColumns}
          data={await getCryptoCurrencyList(user.currency)}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    case "stablecoin":
      return (
        <DataTable
          columns={StablecoinColumns}
          data={await getStableCoinList(user.currency)}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    case "deposit":
      return (
        <DataTable
          columns={DepositColumns}
          data={await getDepositList(user.currency)}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    case "equity":
      return (
        <DataTable
          columns={EquityColumns}
          data={await getEquityList(user.currency)}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    case "fund":
      return (
        <DataTable
          columns={FundColumns}
          data={await getFundList(user.currency)}
          name={assettype}
          columnParams={{ baseCurrency }}
        />
      );
    default:
      throw new Error("Invalid asset type");
  }
}
