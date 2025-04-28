import { Address } from "@graphprotocol/graph-ts";
import {
  Bond,
  CryptoCurrency,
  Deposit,
  Equity,
  Fund,
  StableCoin,
} from "../../../generated/schema";
import { ERC20 } from "../../../generated/templates/Vault/ERC20";

/**
 * Fetches any asset entity by its address and returns its decimals
 * This function tries to load the asset by each possible type since Asset is an interface, not a concrete type.
 * @param address The address of the asset
 * @returns The decimals of the asset or 18 as default
 */
export function fetchAssetDecimals(address: Address): i32 {
  // Try each asset type and return the decimals of the first one found

  let bond = Bond.load(address);
  if (bond != null) {
    return bond.decimals;
  }

  let equity = Equity.load(address);
  if (equity != null) {
    return equity.decimals;
  }

  let fund = Fund.load(address);
  if (fund != null) {
    return fund.decimals;
  }

  let stableCoin = StableCoin.load(address);
  if (stableCoin != null) {
    return stableCoin.decimals;
  }

  let crypto = CryptoCurrency.load(address);
  if (crypto != null) {
    return crypto.decimals;
  }

  let deposit = Deposit.load(address);
  if (deposit != null) {
    return deposit.decimals;
  }

  const endpoint = ERC20.bind(address);
  const decimals = endpoint.try_decimals();

  // Default to 18 if asset not found (most common decimals value)
  return decimals.reverted ? 18 : decimals.value;
}
