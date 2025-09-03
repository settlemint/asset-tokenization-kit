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

    /// @notice Adds a new trusted issuer to the registry with a specified list of claim topics they are authorized for
    /// @dev Token-specific implementation that validates subject matches token's onchainID
    /// @param subject The subject identifier (must match token's onchainID)
    /// @param trustedIssuer The ClaimIssuer contract address of the trusted claim issuer
    /// @param claimTopics The set of claim topics that the trusted issuer is allowed to emit
    function addTrustedIssuerForSubject(
        address subject,
        IClaimIssuer trustedIssuer,
        uint256[] calldata claimTopics
    ) external;

    /// @notice Removes an existing trusted issuer from the registry for a specific subject
    /// @dev Token-specific implementation that validates subject matches token's onchainID
    /// @param subject The subject identifier (must match token's onchainID)
    /// @param trustedIssuer The claim issuer to remove
    function removeTrustedIssuerForSubject(address subject, IClaimIssuer trustedIssuer) external;

    /// @notice Updates the list of claim topics for an existing trusted issuer for a specific subject
    /// @dev Token-specific implementation that validates subject matches token's onchainID
    /// @param subject The subject identifier (must match token's onchainID)
    /// @param trustedIssuer The claim issuer to update
    /// @param newClaimTopics The new set of claim topics that the trusted issuer is allowed to emit
    function updateIssuerClaimTopicsForSubject(
        address subject,
        IClaimIssuer trustedIssuer,
        uint256[] calldata newClaimTopics
    ) external;

    /// @notice Gets the list of claim topics for which a specific trusted issuer is authorized for a subject
    /// @dev Token-specific implementation that validates subject matches token's onchainID
    /// @param subject The subject identifier (must match token's onchainID)
    /// @param trustedIssuer The IClaimIssuer contract address of the issuer
    /// @return An array of uint256 values representing the claim topics
    function getTrustedIssuerClaimTopicsForSubject(address subject, IClaimIssuer trustedIssuer)
        external
        view
        returns (uint256[] memory);

    // --- Token-Specific Convenience Getters (subject = token.onchainID()) ---

    /// @notice Returns an array of all currently registered and active trusted issuer contract addresses for this token
    /// @dev Convenience function that uses the token's onchainID as subject internally
    /// @return Array of trusted issuer addresses
    function getTrustedIssuers() external view returns (IClaimIssuer[] memory);

    /// @notice Retrieves the list of claim topics for which a specific trusted issuer is authorized for this token
    /// @dev Convenience function that uses the token's onchainID as subject internally
    /// @param trustedIssuer The IClaimIssuer contract address of the issuer
    /// @return An array of uint256 values representing the claim topics
    function getTrustedIssuerClaimTopics(IClaimIssuer trustedIssuer)
        external
        view
        returns (uint256[] memory);

    /// @notice Retrieves an array of all issuer contract addresses that are trusted for a specific claim topic for this token
    /// @dev Convenience function that uses the token's onchainID as subject internally
    /// @param claimTopic The claim topic to filter trusted issuers for
    /// @return Array of trusted issuer addresses for the specified claim topic
    function getTrustedIssuersForClaimTopic(uint256 claimTopic)
        external
        view
        returns (IClaimIssuer[] memory);

    /// @notice Checks if a specific issuer is trusted for a specific claim topic for this token
    /// @dev Convenience function that uses the token's onchainID as subject internally
    /// @param issuer The address of the issuer to check
    /// @param claimTopic The claim topic to check
    /// @return True if the issuer is trusted for the claim topic, false otherwise
    function hasClaimTopic(address issuer, uint256 claimTopic) external view returns (bool);

    /// @notice Checks if a given address is registered as a trusted issuer in the registry for this token
    /// @dev Convenience function that uses the token's onchainID as subject internally
    /// @param issuer The address of the issuer to check
    /// @return True if the issuer is trusted, false otherwise
    function isTrustedIssuer(address issuer) external view returns (bool);

    /// @notice Returns the token contract that this registry is associated with
    /// @return The IATKToken interface of the associated token
    function token() external view returns (IATKToken);
}