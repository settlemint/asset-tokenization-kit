import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Bond } from "../../../generated/schema";
import { Bond as BondContract } from "../../../generated/templates/Bond/Bond";
import { fetchAccount } from "../../utils/account";
import { toDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";
import { fetchAssetDecimals } from "./asset";

export function fetchBond(
  address: Address,
  timestamp: BigInt = BigInt.zero()
): Bond {
  let bond = Bond.load(address);
  if (!bond) {
    let endpoint = BondContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();
    let maturityDate = endpoint.try_maturityDate();
    let isMatured = endpoint.try_isMatured();
    let paused = endpoint.try_paused();
    let cap = endpoint.try_cap();
    let faceValue = endpoint.try_faceValue();
    let underlyingAsset = endpoint.try_underlyingAsset();
    let yieldSchedule = endpoint.try_yieldSchedule();

    let underlyingAssetDecimals = underlyingAsset.reverted
      ? 18 // Default to 18 (most common decimal value)
      : fetchAssetDecimals(underlyingAsset.value);

    const account = fetchAccount(address);

    bond = new Bond(address);
    bond.type = AssetType.bond;
    bond.asAccount = account.id;
    bond.name = name.reverted ? "" : name.value;
    bond.symbol = symbol.reverted ? "" : symbol.value;
    bond.decimals = decimals.reverted ? 18 : decimals.value;
    bond.totalSupplyExact = BigInt.zero();
    bond.totalSupply = BigDecimal.zero();
    bond.admins = [];
    bond.supplyManagers = [];
    bond.userManagers = [];
    bond.lastActivity = BigInt.zero();
    bond.creator = Address.zero();
    bond.totalMinted = BigDecimal.zero();
    bond.totalMintedExact = BigInt.zero();
    bond.totalBurned = BigDecimal.zero();
    bond.totalBurnedExact = BigInt.zero();
    bond.totalTransferred = BigDecimal.zero();
    bond.totalTransferredExact = BigInt.zero();
    bond.totalHolders = BigInt.zero();
    bond.concentration = BigDecimal.zero();
    bond.deployedOn = timestamp;

    // Bond-specific fields
    bond.capExact = cap.reverted ? BigInt.zero() : cap.value;
    bond.cap = toDecimals(bond.capExact, bond.decimals);
    bond.maturityDate = maturityDate.reverted
      ? BigInt.zero()
      : maturityDate.value;
    bond.isMatured = isMatured.reverted ? false : isMatured.value;
    bond.paused = paused.reverted ? false : paused.value;
    bond.faceValue = faceValue.reverted ? BigInt.zero() : faceValue.value;

    bond.underlyingAsset = underlyingAsset.reverted
      ? Address.zero()
      : underlyingAsset.value;
    bond.underlyingAssetDecimals = underlyingAssetDecimals;
    bond.redeemedAmount = BigDecimal.zero();
    bond.redeemedAmountExact = BigInt.zero();
    bond.underlyingBalanceExact = BigInt.zero();
    bond.underlyingBalance = BigDecimal.zero();
    bond.yieldSchedule =
      yieldSchedule.reverted || yieldSchedule.value == Address.zero()
        ? null
        : yieldSchedule.value;
    bond.totalUnderlyingNeededExact = BigInt.zero();
    bond.totalUnderlyingNeeded = BigDecimal.zero();
    bond.hasSufficientUnderlying = false;
    bond.save();

    account.asAsset = bond.id;
    account.save();
  }
  return bond;
}
