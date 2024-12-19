import { Address, BigInt } from '@graphprotocol/graph-ts';
import { StableCoin } from '../../generated/schema';
import { StableCoin as StableCoinContract } from '../../generated/templates/StableCoin/StableCoin';
import { toDecimals } from '../utils/decimals';
import { fetchAccount } from './account';

export function fetchStableCoin(address: Address): StableCoin {
  let stableCoin = StableCoin.load(address);
  if (!stableCoin) {
    let endpoint = StableCoinContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let totalSupply = endpoint.try_totalSupply();
    let collateral = endpoint.try_collateral();
    let paused = endpoint.try_paused();

    const account = fetchAccount(address);

    stableCoin = new StableCoin(address);
    stableCoin.name = name.reverted ? '' : name.value;
    stableCoin.symbol = symbol.reverted ? '' : symbol.value;
    stableCoin.decimals = decimals.reverted ? 18 : decimals.value;
    stableCoin.totalSupplyExact = totalSupply.reverted ? BigInt.zero() : totalSupply.value;
    stableCoin.totalSupply = toDecimals(stableCoin.totalSupplyExact);
    stableCoin.collateralExact = collateral.reverted ? BigInt.zero() : collateral.value.getAmount();
    stableCoin.collateral = toDecimals(stableCoin.collateralExact);
    stableCoin.paused = paused.reverted ? false : paused.value;
    stableCoin.asAccount = stableCoin.id;
    stableCoin.save();

    account.asAsset = stableCoin.id;
    account.save();
  }
  return stableCoin;
}
