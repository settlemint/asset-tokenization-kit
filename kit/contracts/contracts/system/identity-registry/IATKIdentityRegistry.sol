// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ISMARTIdentityRegistry } from "../../smart/interface/ISMARTIdentityRegistry.sol";

/**
 * @title IATKIdentityRegistry
 * @author SettleMint
 * @notice Interface for the ATK Identity Registry, managing identity verification and registration
 * @dev Extends ISMARTIdentityRegistry to provide ATK-specific initialization functionality
 *      for managing identities within the ATK token ecosystem
 */
interface IATKIdentityRegistry is ISMARTIdentityRegistry {
    function initialize(
        address initialAdmin,
        address[] memory registrarAdmins,
        address identityStorage,
        address trustedIssuersRegistry,
        address topicSchemeRegistry
    )
        external;
}
