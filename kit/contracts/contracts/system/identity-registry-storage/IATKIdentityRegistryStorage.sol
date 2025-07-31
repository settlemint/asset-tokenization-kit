// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTIdentityRegistryStorage } from "../../smart/interface/ISMARTIdentityRegistryStorage.sol";

/**
 * @title IATKIdentityRegistryStorage
 * @author SettleMint
 * @notice Interface for the ATK Identity Registry Storage, managing identity data persistence
 * @dev Extends ISMARTIdentityRegistryStorage to provide ATK-specific initialization functionality.
 *      This contract stores the mapping between addresses and their associated identity contracts.
 */
interface IATKIdentityRegistryStorage is ISMARTIdentityRegistryStorage {
    /// @notice Initializes the identity registry storage
    /// @dev Sets up the system address and initial admin for the registry
    /// @param systemAddress The address of the ATK system contract
    /// @param initialAdmin The address that will have initial admin privileges
    function initialize(address systemAddress, address initialAdmin) external;
}
