import { Address, BigInt } from '@graphprotocol/graph-ts';
import { CryptoCurrency } from '../../generated/schema';
import { CryptoCurrency as CryptoCurrencyContract } from '../../generated/templates/CryptoCurrency/CryptoCurrency';
import { toDecimals } from '../utils/decimals';
import { fetchAccount } from './account';

export function fetchCryptoCurrency(address: Address): CryptoCurrency {
  let cryptoCurrency = CryptoCurrency.load(address);
  if (!cryptoCurrency) {
    let endpoint = CryptoCurrencyContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let totalSupply = endpoint.try_totalSupply();

    const account = fetchAccount(address);

    cryptoCurrency = new CryptoCurrency(address);
    cryptoCurrency.name = name.reverted ? '' : name.value;
    cryptoCurrency.symbol = symbol.reverted ? '' : symbol.value;
    cryptoCurrency.decimals = decimals.reverted ? 18 : decimals.value;
    cryptoCurrency.totalSupplyExact = totalSupply.reverted ? BigInt.zero() : totalSupply.value;
    cryptoCurrency.totalSupply = toDecimals(cryptoCurrency.totalSupplyExact, cryptoCurrency.decimals);
    cryptoCurrency.asAccount = cryptoCurrency.id;
    cryptoCurrency.save();

    account.asAsset = cryptoCurrency.id;
    account.save();
  }
  return cryptoCurrency;
}
