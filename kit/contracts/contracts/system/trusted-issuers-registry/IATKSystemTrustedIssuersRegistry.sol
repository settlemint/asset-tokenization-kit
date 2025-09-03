// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// Interface imports
import { IATKTrustedIssuersRegistry } from "./IATKTrustedIssuersRegistry.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

/// @title IATKSystemTrustedIssuersRegistry - System Trusted Issuers Registry Interface
/// @author SettleMint
/// @notice Interface for the system ATK trusted issuers registry, managing system-wide trusted claim issuers
/// @dev Extends the base IATKTrustedIssuersRegistry to provide system-specific functionality.
///      The system registry operates on system-wide issuers without subject parameters.
interface IATKSystemTrustedIssuersRegistry is IATKTrustedIssuersRegistry, IATKSystemAccessManaged {

    // --- System Registry Modification Functions ---
    // These functions are system-specific convenience functions that internally use address(0) as subject

    /// @notice Adds a new trusted issuer to the system registry with a specified list of claim topics
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @param trustedIssuer The ClaimIssuer contract address of the trusted claim issuer
    /// @param claimTopics The set of claim topics that the trusted issuer is allowed to emit
    function addTrustedIssuer(IClaimIssuer trustedIssuer, uint256[] calldata claimTopics) external;

    /// @notice Removes an existing trusted issuer from the system registry
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @param trustedIssuer The claim issuer to remove
    function removeTrustedIssuer(IClaimIssuer trustedIssuer) external;

    /// @notice Updates the list of claim topics for an existing trusted issuer in the system registry
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @param trustedIssuer The claim issuer to update
    /// @param newClaimTopics The new set of claim topics that the trusted issuer is allowed to emit
    function updateIssuerClaimTopics(IClaimIssuer trustedIssuer, uint256[] calldata newClaimTopics) external;

    // --- System Registry Convenience Query Functions ---
    // These functions are system-specific convenience functions that internally use address(0) as subject

    /// @notice Returns an array of all currently registered and active trusted issuer contract addresses
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @return Array of trusted issuer addresses
    function getTrustedIssuers() external view returns (IClaimIssuer[] memory);

    /// @notice Retrieves the list of claim topics for which a specific trusted issuer is authorized
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @param trustedIssuer The IClaimIssuer contract address of the issuer
    /// @return An array of uint256 values representing the claim topics
    function getTrustedIssuerClaimTopics(IClaimIssuer trustedIssuer)
        external
        view
        returns (uint256[] memory);

    /// @notice Retrieves an array of all issuer contract addresses that are trusted for a specific claim topic
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @param claimTopic The claim topic to filter trusted issuers for
    /// @return Array of trusted issuer addresses for the specified claim topic
    function getTrustedIssuersForClaimTopic(uint256 claimTopic)
        external
        view
        returns (IClaimIssuer[] memory);

    /// @notice Checks if a specific issuer is trusted for a specific claim topic
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @param issuer The address of the issuer to check
    /// @param claimTopic The claim topic to check
    /// @return True if the issuer is trusted for the claim topic, false otherwise
    function hasClaimTopic(address issuer, uint256 claimTopic) external view returns (bool);

    /// @notice Checks if a given address is registered as a trusted issuer in the registry
    /// @dev System-specific convenience function that internally delegates to subject-aware version with address(0)
    /// @param issuer The address of the issuer to check
    /// @return True if the issuer is trusted, false otherwise
    function isTrustedIssuer(address issuer) external view returns (bool);

    /// @notice Initializes the system registry with access manager
    /// @param accessManager The address of the access manager
    function initialize(address accessManager) external;
}