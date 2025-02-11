import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { StableCoin } from '../../../generated/schema';
import { StableCoin as StableCoinContract } from '../../../generated/templates/StableCoin/StableCoin';
import { fetchAccount } from '../../fetch/account';
import { AssetType } from '../../utils/enums';

export function fetchStableCoin(address: Address): StableCoin {
  let stableCoin = StableCoin.load(address);
  if (!stableCoin) {
    let endpoint = StableCoinContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let isin = endpoint.try_isin();
    let paused = endpoint.try_paused();

    const account = fetchAccount(address);

    stableCoin = new StableCoin(address);
    stableCoin.type = AssetType.stablecoin;
    stableCoin.asAccount = account.id;
    stableCoin.name = name.reverted ? '' : name.value;
    stableCoin.symbol = symbol.reverted ? '' : symbol.value;
    stableCoin.decimals = decimals.reverted ? 18 : decimals.value;
    stableCoin.totalSupplyExact = BigInt.zero();
    stableCoin.totalSupply = BigDecimal.zero();
    stableCoin.admins = [];
    stableCoin.supplyManagers = [];
    stableCoin.userManagers = [];
    stableCoin.lastActivity = BigInt.zero();

    // StableCoin-specific fields
    stableCoin.isin = isin.reverted ? '' : isin.value;
    stableCoin.collateralExact = BigInt.zero();
    stableCoin.collateral = BigDecimal.zero();
    stableCoin.paused = paused.reverted ? false : paused.value;
    stableCoin.save();

    account.asAsset = stableCoin.id;
    account.save();
  }
  return stableCoin;
}
