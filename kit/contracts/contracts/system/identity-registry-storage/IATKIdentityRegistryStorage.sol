// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTIdentityRegistryStorage } from "../../smart/interface/ISMARTIdentityRegistryStorage.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

/// @title IATKIdentityRegistryStorage
/// @author SettleMint
/// @notice Interface for the ATK Identity Registry Storage, managing identity data persistence
/// @dev Extends ISMARTIdentityRegistryStorage to provide ATK-specific initialization functionality.
///      This contract stores the mapping between addresses and their associated identity contracts.
interface IATKIdentityRegistryStorage is ISMARTIdentityRegistryStorage, IATKSystemAccessManaged {
    /// @notice Initializes the identity registry storage
    /// @param accessManager The address of the access manager
    function initialize(address accessManager) external;
}
