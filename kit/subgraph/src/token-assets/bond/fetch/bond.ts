import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { TokenBond } from "../../../../generated/schema";
import { Bond as BondTemplate } from "../../../../generated/templates";
import { setBigNumber } from "../../../utils/bignumber";

export function fetchBond(address: Address): TokenBond {
  let bond = TokenBond.load(address);

  if (!bond) {
    bond = new TokenBond(address);
    setBigNumber(bond, "faceValue", BigInt.zero(), 18);
    bond.maturityDate = BigInt.zero();
    bond.isMatured = false;
    bond.denominationAsset = Address.zero();
    bond.denominationAssetMaturityAmount = BigDecimal.zero();
    bond.denominationAssetMaturityAmountExact = BigInt.zero();
    bond.save();
    BondTemplate.create(address);
  }

  return bond;
}
