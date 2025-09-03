// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// Interface imports
import { IATKTrustedIssuersRegistry } from "../../trusted-issuers-registry/IATKTrustedIssuersRegistry.sol";
import { IATKToken } from "../IATKToken.sol";

/// @title IATKTokenTrustedIssuersRegistry - Token-Specific Trusted Issuers Registry Interface
/// @author SettleMint
/// @notice Interface for token-specific trusted issuer registry operations
/// @dev This interface defines token-specific functionality for managing trusted issuers.
///      Token registries validate that the subject parameter matches the token's onchainID
///      and provide token-specific access control via GOVERNANCE_ROLE.
interface IATKTokenTrustedIssuersRegistry is IATKTrustedIssuersRegistry {

    // --- Token-Specific Modification Functions ---

    /// @notice Adds a new trusted issuer to the token registry with a specified list of claim topics
    /// @dev Token-specific implementation where subject is always the token's onchainID
    /// @param trustedIssuer The ClaimIssuer contract address of the trusted claim issuer
    /// @param claimTopics The set of claim topics that the trusted issuer is allowed to emit
    function addTrustedIssuer(IClaimIssuer trustedIssuer, uint256[] calldata claimTopics) external;

    /// @notice Removes an existing trusted issuer from the token registry
    /// @dev Token-specific implementation where subject is always the token's onchainID
    /// @param trustedIssuer The claim issuer to remove
    function removeTrustedIssuer(IClaimIssuer trustedIssuer) external;

    /// @notice Updates the list of claim topics for an existing trusted issuer in the token registry
    /// @dev Token-specific implementation where subject is always the token's onchainID
    /// @param trustedIssuer The claim issuer to update
    /// @param newClaimTopics The new set of claim topics that the trusted issuer is allowed to emit
    function updateIssuerClaimTopics(IClaimIssuer trustedIssuer, uint256[] calldata newClaimTopics) external;

    // --- Token-Specific Getters ---

    /// @notice Returns the token contract that this registry is associated with
    /// @return The IATKToken interface of the associated token
    function token() external view returns (IATKToken);
}