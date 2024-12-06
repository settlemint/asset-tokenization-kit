import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Equity } from '../../generated/schema';
import { Equity as EquityContract } from '../../generated/templates/Equity/Equity';
import { toDecimals } from '../utils/decimals';
import { fetchAccount } from './account';

export function fetchEquity(address: Address): Equity {
  let equity = Equity.load(address);
  if (!equity) {
    let endpoint = EquityContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let totalSupply = endpoint.try_totalSupply();
    let equityClass = endpoint.try_equityClass();
    let equityCategory = endpoint.try_equityCategory();
    let paused = endpoint.try_paused();
    let owner = endpoint.try_owner();

    const account = fetchAccount(address);

    equity = new Equity(address);
    equity.name = name.reverted ? '' : name.value;
    equity.symbol = symbol.reverted ? '' : symbol.value;
    equity.decimals = decimals.reverted ? 18 : decimals.value;
    equity.totalSupplyExact = totalSupply.reverted ? BigInt.zero() : totalSupply.value;
    equity.totalSupply = toDecimals(equity.totalSupplyExact);
    equity.equityClass = equityClass.reverted ? '' : equityClass.value;
    equity.equityCategory = equityCategory.reverted ? '' : equityCategory.value;
    equity.paused = paused.reverted ? false : paused.value;
    equity.owner = owner.reverted ? Address.zero() : owner.value;
    equity.asAccount = equity.id;
    equity.save();

    account.asAsset = equity.id;
    account.save();
  }
  return equity;
}
