import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Equity } from "../../../generated/schema";
import { Equity as EquityContract } from "../../../generated/templates/Equity/Equity";
import { fetchAccount } from "../../fetch/account";
import { AssetType } from "../../utils/enums";

export function fetchEquity(address: Address): Equity {
  let equity = Equity.load(address);
  if (!equity) {
    let endpoint = EquityContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let isin = endpoint.try_isin();
    let equityClass = endpoint.try_equityClass();
    let equityCategory = endpoint.try_equityCategory();
    let paused = endpoint.try_paused();

    const account = fetchAccount(address);

    equity = new Equity(address);
    equity.type = AssetType.equity;
    equity.asAccount = account.id;
    equity.name = name.reverted ? "" : name.value;
    equity.symbol = symbol.reverted ? "" : symbol.value;
    equity.decimals = decimals.reverted ? 18 : decimals.value;
    equity.totalSupplyExact = BigInt.zero();
    equity.totalSupply = BigDecimal.zero();
    equity.admins = [];
    equity.supplyManagers = [];
    equity.userManagers = [];
    equity.lastActivity = BigInt.zero();
    equity.creator = Address.zero();

    // Equity-specific fields
    equity.isin = isin.reverted ? "" : isin.value;
    equity.equityClass = equityClass.reverted ? "" : equityClass.value;
    equity.equityCategory = equityCategory.reverted ? "" : equityCategory.value;
    equity.paused = paused.reverted ? false : paused.value;
    equity.save();

    account.asAsset = equity.id;
    account.save();
  }
  return equity;
}
