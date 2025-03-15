import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import type { Address } from "viem";
import type { AssetType } from "../../types";

interface DetailDataProps {
	assettype: AssetType;
	address: Address;
}

export async function getDetailData({
	assettype,
	address,
}: DetailDataProps): Promise<
	| ReturnType<typeof getBondDetail>
	| ReturnType<typeof getCryptoCurrencyDetail>
	| ReturnType<typeof getStableCoinDetail>
	| ReturnType<typeof getTokenizedDepositDetail>
	| ReturnType<typeof getEquityDetail>
	| ReturnType<typeof getFundDetail>
> {
	switch (assettype) {
		case "bonds":
			return getBondDetail({ address });
		case "cryptocurrencies":
			return getCryptoCurrencyDetail({ address });
		case "stablecoins":
			return getStableCoinDetail({ address });
		case "tokenizeddeposits":
			return getTokenizedDepositDetail({ address });
		case "equities":
			return getEquityDetail({ address });
		case "funds":
			return getFundDetail({ address });
	}
}
