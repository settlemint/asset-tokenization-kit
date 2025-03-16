import type { Address } from "viem";
import type { AssetType } from "../../../types";
import { BondsRelated } from "./related/bonds";
import { CryptocurrenciesRelated } from "./related/cryptocurrencies";
import { EquitiesRelated } from "./related/equities";
import { FundsRelated } from "./related/funds";
import { StablecoinsRelated } from "./related/stablecoins";
import { TokenizedDepositsRelated } from "./related/tokenizeddeposits";

interface RelatedProps {
	assettype: AssetType;
	address: Address;
	totalSupply: number;
	freeCollateral?: number;
	symbol: string;
}

export function Related({
	assettype,
	address,
	totalSupply,
	freeCollateral,
	symbol,
}: RelatedProps) {
	switch (assettype) {
		case "bonds":
			return <BondsRelated address={address} totalSupply={totalSupply} />;
		case "cryptocurrencies":
			return <CryptocurrenciesRelated address={address} />;
		case "stablecoins":
			return (
				<StablecoinsRelated
					address={address}
					totalSupply={totalSupply}
					freeCollateral={freeCollateral ?? 0}
					symbol={symbol ?? ""}
				/>
			);
		case "tokenizeddeposits":
			return (
				<TokenizedDepositsRelated address={address} totalSupply={totalSupply} />
			);
		case "equities":
			return <EquitiesRelated address={address} totalSupply={totalSupply} />;
		case "funds":
			return <FundsRelated address={address} totalSupply={totalSupply} />;
	}
}
