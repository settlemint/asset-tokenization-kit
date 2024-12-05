import { Address } from '@graphprotocol/graph-ts';
import { Equity } from '../../generated/schema';
import { Equity as EquityContract } from '../../generated/templates/Equity/Equity';
import { fetchAccount } from './account';
import { fetchTotalSupply } from './balance';

export function fetchEquity(address: Address): Equity {
  let equity = Equity.load(address);
  if (!equity) {
    let endpoint = EquityContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();

    const account = fetchAccount(address);

    equity = new Equity(address);
    equity.name = name.reverted ? '' : name.value;
    equity.symbol = symbol.reverted ? '' : symbol.value;
    equity.decimals = decimals.reverted ? 18 : decimals.value;
    equity.totalSupply = fetchTotalSupply(address).id;
    equity.asAccount = equity.id;
    equity.save();

    account.asAsset = equity.id;
    account.save();
  }
  return equity;
}
