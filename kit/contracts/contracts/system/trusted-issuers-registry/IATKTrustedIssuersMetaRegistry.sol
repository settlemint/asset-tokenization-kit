// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// ISMARTinterface
import { ISMARTTrustedIssuersRegistry } from "../../smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { ISMARTTrustedIssuersMetaRegistry } from "../../smart/interface/ISMARTTrustedIssuersMetaRegistry.sol";

/// @title IATKTrustedIssuersMetaRegistry - Registry-of-Registries Interface
/// @author SettleMint
/// @notice Interface for managing a registry-of-registries system that tracks global and contract-specific
///         trusted issuers registries. This enables lightweight tokens while maintaining comprehensive
///         trusted issuer management.
/// @dev This interface defines a meta-registry that:
///      - Stores a global trusted issuers registry for system-wide issuers
///      - Maps contract addresses to their specific trusted issuers registries
///      - Provides aggregated query functions that check both global and contract-specific registries
///      - Enables efficient trusted issuer management without bloating token runtime size
interface IATKTrustedIssuersMetaRegistry is IERC165, ISMARTTrustedIssuersMetaRegistry {
    // --- Events ---

    /// @notice Emitted when the global registry is set or updated
    /// @param sender The address that initiated the change
    /// @param oldRegistry The address of the previous global registry (address(0) if none)
    /// @param newRegistry The address of the new global registry
    event GlobalRegistrySet(
        address indexed sender,
        address indexed oldRegistry,
        address indexed newRegistry
    );

    /// @notice Emitted when a contract-specific registry is set or updated
    /// @param sender The address that initiated the change
    /// @param contractAddress The contract address for which the registry is being set
    /// @param oldRegistry The address of the previous registry for this contract (address(0) if none)
    /// @param newRegistry The address of the new registry for this contract
    event ContractRegistrySet(
        address indexed sender,
        address indexed contractAddress,
        address indexed oldRegistry,
        address newRegistry
    );

    /// @notice Initializes the registry with an initial admin and registrars.
    /// @param accessManager The address of the access manager
    function initialize(address accessManager) external;

}