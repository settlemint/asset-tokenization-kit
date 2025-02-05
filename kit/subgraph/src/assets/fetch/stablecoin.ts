import { Address, BigInt } from '@graphprotocol/graph-ts';
import { StableCoin } from '../../../generated/schema';
import { StableCoin as StableCoinContract } from '../../../generated/templates/StableCoin/StableCoin';
import { fetchAccount } from '../../fetch/account';
import { toDecimals } from '../../utils/decimals';
import { AssetType } from '../../utils/enums';

export function fetchStableCoin(address: Address): StableCoin {
  let stableCoin = StableCoin.load(address);
  if (!stableCoin) {
    let endpoint = StableCoinContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let isin = endpoint.try_isin();
    let totalSupply = endpoint.try_totalSupply();
    let collateral = endpoint.try_collateral();
    let paused = endpoint.try_paused();

    const account = fetchAccount(address);

    stableCoin = new StableCoin(address);
    stableCoin.type = AssetType.stablecoin;
    stableCoin.name = name.reverted ? '' : name.value;
    stableCoin.symbol = symbol.reverted ? '' : symbol.value;
    stableCoin.decimals = decimals.reverted ? 18 : decimals.value;
    stableCoin.isin = isin.reverted ? '' : isin.value;
    stableCoin.totalSupplyExact = totalSupply.reverted ? BigInt.zero() : totalSupply.value;
    stableCoin.totalSupply = toDecimals(stableCoin.totalSupplyExact, stableCoin.decimals);
    stableCoin.collateralExact = collateral.reverted ? BigInt.zero() : collateral.value.getAmount();
    stableCoin.collateral = toDecimals(stableCoin.collateralExact, stableCoin.decimals);
    stableCoin.paused = paused.reverted ? false : paused.value;
    stableCoin.asAccount = stableCoin.id;
    stableCoin.admins = [];
    stableCoin.supplyManagers = [];
    stableCoin.userManagers = [];
    stableCoin.save();

    account.asAsset = stableCoin.id;
    account.save();
  }
  return stableCoin;
}
