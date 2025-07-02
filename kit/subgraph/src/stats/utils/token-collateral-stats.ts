import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Token, TokenCollateralStatsData } from "../../../generated/schema";
import { fetchIdentityClaim } from "../../identity/fetch/identity-claim-value";
import { fetchIdentity } from "../../identity/fetch/identity";
import { ONE_BI, ZERO_BD, ZERO_BI } from "../../utils/constants";

export function updateTokenCollateralStats(token: Token): void {
  // Create a new timeseries entry for TokenCollateralStatsData
  const statsData = new TokenCollateralStatsData(ONE_BI);
  statsData.token = token.id;

  // Initialize with zero values
  let collateralAmount = ZERO_BD;
  let collateralAmountExact = ZERO_BI;

  // Check if token has collateral
  if (token.collateral && token.collateral!) {
    const collateral = token.collateral!;
    
    // Check if collateral has an identity claim
    if (collateral.identityClaim) {
      const claimId = collateral.identityClaim!;
      
      // Get the identity from the claim
      const parts = claimId.toString().split("-");
      if (parts.length >= 2) {
        const identityAddress = Address.fromString(parts[0]);
        const identity = fetchIdentity(identityAddress);
        const claim = fetchIdentityClaim(identity, BigInt.fromString(parts[1]));
        
        // Only process if claim is not revoked
        if (!claim.revoked) {
          // Get collateral amount from claim values
          const values = claim.values.load();
          for (let i = 0; i < values.length; i++) {
            const value = values[i];
            if (value.key == "amount") {
              collateralAmountExact = BigInt.fromString(value.value);
              // Assuming collateral uses same decimals as token
              const divisor = BigInt.fromI32(10).pow(token.decimals as u8);
              collateralAmount = collateralAmountExact.toBigDecimal().div(divisor.toBigDecimal());
              break;
            }
          }
        }
      }
    }
  }

  // Set the collateral values
  statsData.collateral = collateralAmount;
  statsData.collateralExact = collateralAmountExact;
  
  // For now, set available = total and used = 0
  // These could be updated based on business logic (e.g., if collateral is locked for specific purposes)
  statsData.collateralAvailable = collateralAmount;
  statsData.collateralAvailableExact = collateralAmountExact;
  statsData.collateralUsed = ZERO_BD;
  statsData.collateralUsedExact = ZERO_BI;

  statsData.save();
}