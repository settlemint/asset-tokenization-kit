// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ISMARTIdentityRegistryStorage } from "../../smart/interface/ISMARTIdentityRegistryStorage.sol";

/**
 * @title IATKIdentityRegistryStorage
 * @author SettleMint
 * @notice Interface for the ATK Identity Registry Storage, managing identity data persistence
 * @dev Extends ISMARTIdentityRegistryStorage to provide ATK-specific initialization functionality.
 *      This contract stores the mapping between addresses and their associated identity contracts.
 */
interface IATKIdentityRegistryStorage is ISMARTIdentityRegistryStorage {
    function initialize(address systemAddress, address initialAdmin) external;
}
