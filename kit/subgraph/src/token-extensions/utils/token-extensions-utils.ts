import { Bytes, log } from "@graphprotocol/graph-ts";
import { InterfaceIds } from "../../erc165/utils/interfaceids";

/**
 * @notice Token extensions.
 */
export class TokenExtension {
  static ACCESS_MANAGED: string = "ACCESS_MANAGED";
  static BOND: string = "BOND";
  static BURNABLE: string = "BURNABLE";
  static CAPPED: string = "CAPPED";
  static COLLATERAL: string = "COLLATERAL";
  static CUSTODIAN: string = "CUSTODIAN";
  static FUND: string = "FUND";
  static HISTORICAL_BALANCES: string = "HISTORICAL_BALANCES";
  static PAUSABLE: string = "PAUSABLE";
  static REDEEMABLE: string = "REDEEMABLE";
  static YIELD: string = "YIELD";
}

/**
 * @notice Get the extensions of a token from the implementation interfaces.
 * @param implementationInterfaces The implementation interfaces of the token.
 * @returns The extensions of the token.
 */
export function getTokenExtensions(
  implementationInterfaces: Bytes[]
): string[] {
  const extensions: Array<string> = [];
  for (let i = 0; i < implementationInterfaces.length; i++) {
    const interfaceId = implementationInterfaces[i];
    if (interfaceId.equals(InterfaceIds.ISMARTTokenAccessManaged)) {
      extensions.push(TokenExtension.ACCESS_MANAGED);
    } else if (interfaceId.equals(InterfaceIds.ISMARTBurnable)) {
      extensions.push(TokenExtension.BURNABLE);
    } else if (interfaceId.equals(InterfaceIds.ISMARTCapped)) {
      extensions.push(TokenExtension.CAPPED);
    } else if (interfaceId.equals(InterfaceIds.ISMARTCollateral)) {
      extensions.push(TokenExtension.COLLATERAL);
    } else if (interfaceId.equals(InterfaceIds.ISMARTCustodian)) {
      extensions.push(TokenExtension.CUSTODIAN);
    } else if (interfaceId.equals(InterfaceIds.ISMARTHistoricalBalances)) {
      extensions.push(TokenExtension.HISTORICAL_BALANCES);
    } else if (interfaceId.equals(InterfaceIds.ISMARTPausable)) {
      extensions.push(TokenExtension.PAUSABLE);
    } else if (interfaceId.equals(InterfaceIds.ISMARTRedeemable)) {
      extensions.push(TokenExtension.REDEEMABLE);
    } else if (interfaceId.equals(InterfaceIds.ISMARTYield)) {
      extensions.push(TokenExtension.YIELD);
    } else if (interfaceId.equals(InterfaceIds.IATKBond)) {
      extensions.push(TokenExtension.BOND);
    } else if (interfaceId.equals(InterfaceIds.IATKFund)) {
      extensions.push(TokenExtension.FUND);
    } else {
      log.warning("Unknown token extension interface: {}", [
        interfaceId.toHexString(),
      ]);
    }
  }

  return extensions.sort();
}
