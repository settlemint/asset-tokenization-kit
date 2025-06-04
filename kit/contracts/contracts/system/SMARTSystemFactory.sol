// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTSystem } from "./SMARTSystem.sol";
import { ISMARTSystemFactory } from "./ISMARTSystemFactory.sol";
import {
    ComplianceImplementationNotSet,
    IdentityRegistryImplementationNotSet,
    IdentityRegistryStorageImplementationNotSet,
    TrustedIssuersRegistryImplementationNotSet,
    IdentityFactoryImplementationNotSet,
    IdentityImplementationNotSet,
    TokenIdentityImplementationNotSet,
    TokenAccessManagerImplementationNotSet,
    IndexOutOfBounds,
    TopicSchemeRegistryImplementationNotSet,
    IdentityVerificationModuleNotSet
} from "./SMARTSystemErrors.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

// --- Contract Definition ---

/// @title SMARTSystemFactory
/// @author SettleMint Tokenization Services
/// @notice This contract serves as a factory for deploying new instances of the `SMARTSystem` contract.
/// @dev It simplifies the deployment of `SMARTSystem` by using a predefined set of default implementation addresses
/// for the various modules (compliance, identity registry, etc.) that `SMARTSystem` manages.
/// This factory also supports meta-transactions through OpenZeppelin's `ERC2771Context`, allowing users to interact
/// with it (e.g., to create a new `SMARTSystem`) without paying for gas directly, provided a trusted forwarder is used.
/// The factory keeps track of all `SMARTSystem` instances it creates.
contract SMARTSystemFactory is ISMARTSystemFactory, ERC2771Context {
    // --- State Variables ---
    // Immutable variables are set once at construction and cannot be changed later, saving gas.

    /// @notice The default contract address for the compliance module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial compliance
    /// implementation.
    address public immutable defaultComplianceImplementation;
    /// @notice The default contract address for the identity registry module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial identity registry
    /// implementation.
    address public immutable defaultIdentityRegistryImplementation;
    /// @notice The default contract address for the identity registry storage module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial identity registry
    /// storage implementation.
    address public immutable defaultIdentityRegistryStorageImplementation;
    /// @notice The default contract address for the trusted issuers registry module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial trusted issuers
    /// registry implementation.
    address public immutable defaultTrustedIssuersRegistryImplementation;
    /// @notice The default contract address for the topic scheme registry module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial topic scheme
    /// registry implementation.
    address public immutable defaultTopicSchemeRegistryImplementation;
    /// @notice The default contract address for the identity factory module's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial identity factory
    /// implementation.
    address public immutable defaultIdentityFactoryImplementation;
    /// @notice The default contract address for the standard identity contract's logic (template/implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial standard identity
    /// implementation.
    address public immutable defaultIdentityImplementation;
    /// @notice The default contract address for the token identity contract's logic (template/implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial token identity
    /// implementation.
    address public immutable defaultTokenIdentityImplementation;
    /// @notice The default contract address for the token access manager contract's logic (implementation).
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial token access manager
    /// implementation.
    address public immutable defaultTokenAccessManagerImplementation;
    /// @notice The address of the trusted forwarder contract used by this factory for meta-transactions (ERC2771).
    /// @dev This same forwarder address will also be passed to each new `SMARTSystem` instance created by this factory,
    /// enabling them to support meta-transactions as well.
    address public immutable factoryForwarder;
    /// @notice The default contract address for the identity verification module's logic.
    /// @dev This address will be passed to newly created `SMARTSystem` instances as the initial identity verification
    /// module implementation.
    address public immutable defaultIdentityVerificationModule;

    /// @notice An array storing the addresses of all `SMARTSystem` instances that have been created by this factory.
    /// @dev This allows for easy tracking and retrieval of deployed systems.
    address[] public smartSystems;

    // --- Constructor ---

    /// @notice Constructs the `SMARTSystemFactory` contract.
    /// @dev This function is called only once when the factory contract is deployed.
    /// It initializes the immutable default implementation addresses for all core SMART modules and sets the trusted
    /// forwarder address.
    /// It performs crucial checks to ensure that none of the provided implementation addresses are the zero address, as
    /// these are
    /// essential for the proper functioning of the `SMARTSystem` instances that will be created.
    /// @param complianceImplementation_ The default address for the compliance module's logic contract.
    /// @param identityRegistryImplementation_ The default address for the identity registry module's logic contract.
    /// @param identityRegistryStorageImplementation_ The default address for the identity registry storage module's
    /// logic contract.
    /// @param trustedIssuersRegistryImplementation_ The default address for the trusted issuers registry module's logic
    /// contract.
    /// @param topicSchemeRegistryImplementation_ The default address for the topic scheme registry module's logic
    /// contract.
    /// @param identityFactoryImplementation_ The default address for the identity factory module's logic contract.
    /// @param identityImplementation_ The default address for the standard identity contract's logic (template).
    /// @param tokenIdentityImplementation_ The default address for the token identity contract's logic (template).
    /// @param tokenAccessManagerImplementation_ The default address for the token access manager contract's logic
    /// (template).
    /// @param identityVerificationModule_ The default address for the identity verification module's
    /// logic contract.
    /// @param forwarder_ The address of the trusted forwarder contract to be used for meta-transactions (ERC2771).
    constructor(
        address complianceImplementation_,
        address identityRegistryImplementation_,
        address identityRegistryStorageImplementation_,
        address trustedIssuersRegistryImplementation_,
        address topicSchemeRegistryImplementation_,
        address identityFactoryImplementation_,
        address identityImplementation_,
        address tokenIdentityImplementation_,
        address tokenAccessManagerImplementation_,
        address identityVerificationModule_,
        address forwarder_
    )
        ERC2771Context(forwarder_) // Initializes ERC2771 support with the provided forwarder address.
    {
        // Perform critical checks: ensure no implementation address is the zero address.
        // Reverting here prevents deploying a factory that would create non-functional SMARTSystem instances.
        if (complianceImplementation_ == address(0)) revert ComplianceImplementationNotSet();
        if (identityRegistryImplementation_ == address(0)) revert IdentityRegistryImplementationNotSet();
        if (identityRegistryStorageImplementation_ == address(0)) {
            revert IdentityRegistryStorageImplementationNotSet();
        }
        if (trustedIssuersRegistryImplementation_ == address(0)) {
            revert TrustedIssuersRegistryImplementationNotSet();
        }
        if (topicSchemeRegistryImplementation_ == address(0)) {
            revert TopicSchemeRegistryImplementationNotSet();
        }
        if (identityFactoryImplementation_ == address(0)) {
            revert IdentityFactoryImplementationNotSet();
        }
        if (identityImplementation_ == address(0)) {
            revert IdentityImplementationNotSet(); // Assumes this custom error is defined in SMARTSystemErrors.sol
        }
        if (tokenIdentityImplementation_ == address(0)) {
            revert TokenIdentityImplementationNotSet(); // Assumes this custom error is defined in SMARTSystemErrors.sol
        }
        if (tokenAccessManagerImplementation_ == address(0)) {
            revert TokenAccessManagerImplementationNotSet(); // Assumes this custom error is defined in
                // SMARTSystemErrors.sol
        }
        if (identityVerificationModule_ == address(0)) {
            revert IdentityVerificationModuleNotSet();
        }

        // Set the immutable state variables with the provided addresses.
        defaultComplianceImplementation = complianceImplementation_;
        defaultIdentityRegistryImplementation = identityRegistryImplementation_;
        defaultIdentityRegistryStorageImplementation = identityRegistryStorageImplementation_;
        defaultTrustedIssuersRegistryImplementation = trustedIssuersRegistryImplementation_;
        defaultTopicSchemeRegistryImplementation = topicSchemeRegistryImplementation_;
        defaultIdentityFactoryImplementation = identityFactoryImplementation_;
        defaultIdentityImplementation = identityImplementation_;
        defaultTokenIdentityImplementation = tokenIdentityImplementation_;
        defaultTokenAccessManagerImplementation = tokenAccessManagerImplementation_;
        factoryForwarder = forwarder_; // Store the forwarder address for use by this factory and new systems.
        defaultIdentityVerificationModule = identityVerificationModule_;
    }

    // --- Public Functions ---

    /// @notice Creates and deploys a new `SMARTSystem` instance using the factory's stored default implementation
    /// addresses.
    /// @dev When this function is called, a new `SMARTSystem` contract is created on the blockchain.
    /// The caller of this function (which is `_msgSender()`, resolving to the original user in an ERC2771
    /// meta-transaction context)
    /// will be set as the initial administrator (granted `DEFAULT_ADMIN_ROLE`) of the newly created `SMARTSystem`.
    /// The new system's address is added to the `smartSystems` array for tracking, and a `SMARTSystemCreated` event is
    /// emitted.
    /// @return systemAddress The blockchain address of the newly created `SMARTSystem` contract.
    function createSystem() external returns (address systemAddress) {
        // Determine the initial admin for the new SMARTSystem.
        // _msgSender() correctly identifies the original user even if called via a trusted forwarder (ERC2771).
        address sender = _msgSender();

        // Deploy a new SMARTSystem contract instance.
        // It passes all the default implementation addresses stored in this factory, plus the factory's forwarder
        // address.
        SMARTSystem newSystem = new SMARTSystem(
            sender,
            defaultComplianceImplementation,
            defaultIdentityRegistryImplementation,
            defaultIdentityRegistryStorageImplementation,
            defaultTrustedIssuersRegistryImplementation,
            defaultTopicSchemeRegistryImplementation,
            defaultIdentityFactoryImplementation,
            defaultIdentityImplementation,
            defaultTokenIdentityImplementation,
            defaultTokenAccessManagerImplementation,
            defaultIdentityVerificationModule,
            factoryForwarder // The same forwarder is used for the new system.
        );

        // Get the address of the newly deployed contract.
        systemAddress = address(newSystem);
        // Add the new system's address to our tracking array.
        smartSystems.push(systemAddress);

        // Emit an event to log the creation, including the new system's address and its initial admin.
        emit SMARTSystemCreated(sender, systemAddress);

        // Return the address of the newly created system.
        return systemAddress;
    }

    /// @notice Gets the total number of `SMARTSystem` instances that have been created by this factory.
    /// @dev This is a view function, meaning it only reads blockchain state and does not cost gas to call (if called
    /// externally, not in a transaction).
    /// @return uint256 The count of `SMARTSystem` instances currently stored in the `smartSystems` array.
    function getSystemCount() external view returns (uint256) {
        return smartSystems.length;
    }

    /// @notice Gets the blockchain address of a `SMARTSystem` instance at a specific index in the list of created
    /// systems.
    /// @dev This allows retrieval of addresses for previously deployed `SMARTSystem` contracts.
    /// It will revert with an `IndexOutOfBounds` error if the provided `index` is greater than or equal to the
    /// current number of created systems (i.e., if `index >= smartSystems.length`).
    /// This is a view function.
    /// @param index The zero-based index of the desired `SMARTSystem` in the `smartSystems` array.
    /// @return address The blockchain address of the `SMARTSystem` contract found at the given `index`.
    function getSystemAtIndex(uint256 index) external view returns (address) {
        // Check for valid index to prevent errors.
        if (index >= smartSystems.length) revert IndexOutOfBounds(index, smartSystems.length);
        return smartSystems[index];
    }
}
