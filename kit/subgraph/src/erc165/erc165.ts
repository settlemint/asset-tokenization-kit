import { Address, Bytes, log } from "@graphprotocol/graph-ts";
import { IERC165 } from "../../generated/templates/GenericERC165/IERC165";

/**
 * Utility function to check if a contract supports a specific interface
 * @param contractAddress - The address of the contract to check
 * @param interfaceId - The 4-byte interface identifier to check for
 * @returns boolean indicating if the interface is supported (false if check failed)
 */
export function checkSupportsInterface(
  contractAddress: Address,
  interfaceId: Bytes
): boolean {
  const contract = IERC165.bind(contractAddress);

  const result = contract.try_supportsInterface(interfaceId);

  if (result.reverted) {
    // Contract doesn't implement ERC165 or call failed - return false
    log.warning(
      "Failed to check interface support for contract {} - interface {}",
      [contractAddress.toHexString(), interfaceId.toHexString()]
    );
    return false;
  }

  return result.value;
}
