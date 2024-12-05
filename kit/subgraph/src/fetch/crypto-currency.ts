import { Address } from '@graphprotocol/graph-ts';
import { CryptoCurrency } from '../../generated/schema';
import { CryptoCurrency as CryptoCurrencyContract } from '../../generated/templates/CryptoCurrency/CryptoCurrency';
import { fetchAccount } from './account';
import { fetchTotalSupply } from './balance';

export function fetchCryptoCurrency(address: Address): CryptoCurrency {
  let cryptoCurrency = CryptoCurrency.load(address);
  if (!cryptoCurrency) {
    let endpoint = CryptoCurrencyContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();

    const account = fetchAccount(address);

    cryptoCurrency = new CryptoCurrency(address);
    cryptoCurrency.name = name.reverted ? '' : name.value;
    cryptoCurrency.symbol = symbol.reverted ? '' : symbol.value;
    cryptoCurrency.decimals = decimals.reverted ? 18 : decimals.value;
    cryptoCurrency.totalSupply = fetchTotalSupply(address).id;
    cryptoCurrency.asAccount = cryptoCurrency.id;
    cryptoCurrency.save();

    account.asAsset = cryptoCurrency.id;
    account.save();
  }
  return cryptoCurrency;
}
