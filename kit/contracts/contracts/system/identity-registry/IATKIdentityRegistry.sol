// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTIdentityRegistry } from "../../smart/interface/ISMARTIdentityRegistry.sol";

/**
 * @title IATKIdentityRegistry
 * @author SettleMint
 * @notice Interface for the ATK Identity Registry, managing identity verification and registration
 * @dev Extends ISMARTIdentityRegistry to provide ATK-specific initialization functionality
 *      for managing identities within the ATK token ecosystem
 */
interface IATKIdentityRegistry is ISMARTIdentityRegistry {
    /// @notice Initializes the identity registry
    /// @dev Sets up the registry with initial configuration including admins and related contracts
    /// @param initialAdmin The address that will have initial admin privileges
    /// @param registrarAdmins Array of addresses that will have registrar admin privileges
    /// @param identityStorage The address of the identity storage contract
    /// @param trustedIssuersRegistry The address of the trusted issuers registry contract
    /// @param topicSchemeRegistry The address of the topic scheme registry contract
    function initialize(
        address initialAdmin,
        address[] memory registrarAdmins,
        address identityStorage,
        address trustedIssuersRegistry,
        address topicSchemeRegistry
    )
        external;
}
