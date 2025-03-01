import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Bond } from "../../../generated/schema";
import { Bond as BondContract } from "../../../generated/templates/Bond/Bond";
import { fetchAccount } from "../../fetch/account";
import { toDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";

export function fetchBond(address: Address): Bond {
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
    bond.redeemedAmount = BigInt.zero();
    bond.underlyingBalance = BigInt.zero();
    bond.yieldSchedule = yieldSchedule.reverted ? null : yieldSchedule.value;
    bond.save();

    account.asAsset = bond.id;
    account.save();
  }
  return bond;
}
