// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTIdentityRegistry } from "../../smart/interface/ISMARTIdentityRegistry.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";
import { ExpressionNode } from "../../smart/interface/structs/ExpressionNode.sol";

/// @title IATKIdentityRegistry
/// @author SettleMint
/// @notice Interface for the ATK Identity Registry, managing identity verification and registration
/// @dev Extends ISMARTIdentityRegistry to provide ATK-specific initialization functionality
///      for managing identities within the ATK token ecosystem
interface IATKIdentityRegistry is ISMARTIdentityRegistry, IATKSystemAccessManaged {
    /// @notice Initializes the identity registry
    /// @dev Sets up the registry with initial configuration including admins and related contracts
    /// @param accessManager The address of the access manager
    /// @param identityStorage The address of the identity storage contract
    /// @param trustedIssuersRegistry The address of the trusted issuers registry contract
    /// @param topicSchemeRegistry The address of the topic scheme registry contract
    function initialize(
        address accessManager,
        address identityStorage,
        address trustedIssuersRegistry,
        address topicSchemeRegistry
    )
        external;

    // Note: isVerifiedForContext has been removed as it's no longer needed.
    // The isVerified function in ISMARTIdentityRegistry now handles both simple claim topic verification
    // and the subject-aware trusted issuer queries automatically.
}
