import { Address } from '@graphprotocol/graph-ts';
import { StableCoin } from '../../generated/schema';
import { StableCoin as StableCoinContract } from '../../generated/templates/StableCoin/StableCoin';
import { fetchAccount } from './account';
import { fetchTotalSupply } from './balance';

export function fetchStableCoin(address: Address): StableCoin {
  let stableCoin = StableCoin.load(address);
  if (!stableCoin) {
    let endpoint = StableCoinContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();

    const account = fetchAccount(address);

    stableCoin = new StableCoin(address);
    stableCoin.name = name.reverted ? '' : name.value;
    stableCoin.symbol = symbol.reverted ? '' : symbol.value;
    stableCoin.decimals = decimals.reverted ? 18 : decimals.value;
    stableCoin.totalSupply = fetchTotalSupply(address).id;
    stableCoin.asAccount = stableCoin.id;
    stableCoin.save();

    account.asAsset = stableCoin.id;
    account.save();
  }
  return stableCoin;
}
