import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Token } from "../../../../generated/schema";
import { fetchToken } from "../../../token/fetch/token";
import { setBigNumber } from "../../../utils/bignumber";
import { fetchBond } from "../fetch/bond";

/**
 * Updates the denomination asset maturity amount for a bond based on current total supply.
 * This calculates the total amount of denomination assets needed to redeem all bonds.
 * Formula: (totalSupply * faceValue) / 10^bondDecimals
 *
 * @param bond - The bond entity to update
 * @param token - The token entity representing the bond
 */
export function updateTotalDenominationAssetNeeded(token: Token): void {
  const bond = fetchBond(Address.fromBytes(token.id));
  const denominationAsset = fetchToken(
    Address.fromBytes(bond.denominationAsset)
  );
  const denominationAssetDecimals = denominationAsset.decimals;

  // Calculate the maturity amount in denomination asset units
  // This matches the contract's totalDenominationAssetNeeded() calculation
  let maturityAmountExact: BigInt;

  if (token.totalSupplyExact.equals(BigInt.zero())) {
    maturityAmountExact = BigInt.zero();
  } else {
    // Calculate: (totalSupply * faceValue) / 10^bondDecimals
    // Note: faceValueExact is already in denomination asset base units
    const divisor = BigInt.fromI32(10).pow(denominationAssetDecimals as u8);
    maturityAmountExact = token.totalSupplyExact
      .times(bond.faceValueExact)
      .div(divisor);
  }

  // Update both human-readable and exact values
  setBigNumber(
    bond,
    "denominationAssetNeeded",
    maturityAmountExact,
    denominationAssetDecimals
  );

  bond.save();
}
