import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { StableCoin } from "../../../generated/schema";
import { StableCoin as StableCoinContract } from "../../../generated/templates/StableCoin/StableCoin";
import { fetchAccount } from "../../fetch/account";
import { AssetType } from "../../utils/enums";

export function fetchStableCoin(address: Address): StableCoin {
  let stableCoin = StableCoin.load(address);
  if (!stableCoin) {
    let endpoint = StableCoinContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let paused = endpoint.try_paused();
    let liveness = endpoint.try_liveness();

    const account = fetchAccount(address);

    stableCoin = new StableCoin(address);
    stableCoin.type = AssetType.stablecoin;
    stableCoin.asAccount = account.id;
    stableCoin.name = name.reverted ? "" : name.value;
    stableCoin.symbol = symbol.reverted ? "" : symbol.value;
    stableCoin.decimals = decimals.reverted ? 18 : decimals.value;
    stableCoin.totalSupplyExact = BigInt.zero();
    stableCoin.totalSupply = BigDecimal.zero();
    stableCoin.admins = [];
    stableCoin.supplyManagers = [];
    stableCoin.userManagers = [];
    stableCoin.lastActivity = BigInt.zero();
    stableCoin.creator = Address.zero();
    stableCoin.totalBurned = BigDecimal.zero();
    stableCoin.totalBurnedExact = BigInt.zero();
    stableCoin.totalHolders = 0;

    // StableCoin-specific fields
    stableCoin.collateralExact = BigInt.zero();
    stableCoin.collateral = BigDecimal.zero();
    stableCoin.freeCollateral = BigDecimal.zero();
    stableCoin.freeCollateralExact = BigInt.zero();
    stableCoin.collateralRatio = BigDecimal.zero();
    stableCoin.paused = paused.reverted ? false : paused.value;
    stableCoin.liveness = liveness.reverted ? BigInt.zero() : liveness.value;
    stableCoin.lastCollateralUpdate = BigInt.zero();
    stableCoin.save();

    account.asAsset = stableCoin.id;
    account.save();
  }
  return stableCoin;
}
