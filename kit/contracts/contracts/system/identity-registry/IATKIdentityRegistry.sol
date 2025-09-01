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

    /// @notice Context-aware verification of an investor's identity using logical expressions
    /// @dev This function evaluates logical expressions (claim topic requirements) using both
    ///      global and context-specific trusted issuers. It provides token-specific or contract-specific
    ///      identity verification capabilities while maintaining backward compatibility.
    /// @param _userAddress The investor's wallet address to verify
    /// @param context The context (usually a token contract address) for which to verify claims
    /// @param expression An array of ExpressionNode structs representing a postfix logical expression
    /// @return True if the investor's identity satisfies the logical expression for the given context
    function isVerifiedForContext(
        address _userAddress,
        address context,
        ExpressionNode[] calldata expression
    )
        external
        view
        returns (bool);
}
