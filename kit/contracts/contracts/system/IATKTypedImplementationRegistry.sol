// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IATKTypedImplementationRegistry
 * @author SettleMint NV
 * @notice Interface for a registry that maps type hashes to implementation addresses
 */
interface IATKTypedImplementationRegistry is IERC165 {
    /**
     * @notice Returns the implementation address for a given type hash
     * @param typeHash The keccak256 hash of the type name
     * @return The address of the implementation contract for the given type
     */
    function implementation(bytes32 typeHash) external view returns (address);
}
