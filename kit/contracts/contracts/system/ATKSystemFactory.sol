// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKSystemImplementation } from "./ATKSystemImplementation.sol";
import { IATKSystemFactory } from "./IATKSystemFactory.sol";
import {
    ComplianceImplementationNotSet,
    IdentityRegistryImplementationNotSet,
    IdentityRegistryStorageImplementationNotSet,
    TrustedIssuersRegistryImplementationNotSet,
    TrustedIssuersMetaRegistryImplementationNotSet,
    IdentityFactoryImplementationNotSet,
    IdentityImplementationNotSet,
    ContractIdentityImplementationNotSet,
    TokenAccessManagerImplementationNotSet,
    IndexOutOfBounds,
    TopicSchemeRegistryImplementationNotSet,
    ComplianceModuleRegistryImplementationNotSet,
    AddonRegistryImplementationNotSet,
    TokenFactoryRegistryImplementationNotSet,
    SystemAccessManagerImplementationNotSet,
    InvalidSystemImplementation
} from "./ATKSystemErrors.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { ATKSystemAccessManagerImplementation } from "./access-manager/ATKSystemAccessManagerImplementation.sol";
import { IATKSystemAccessManager } from "./access-manager/IATKSystemAccessManager.sol";
import { ATKPeopleRoles } from "./ATKPeopleRoles.sol";
import { ATKRoles } from "./ATKRoles.sol";
import { ATKSystemRoles } from "./ATKSystemRoles.sol";

// --- Contract Definition ---

/// @title ATKSystemFactory
/// @author SettleMint
/// @notice This contract serves as a factory for deploying new instances of the `ATKSystem` contract.
/// @dev It simplifies the deployment of `ATKSystem` by using a predefined set of default implementation addresses
/// for the various modules (compliance, identity registry, etc.) that `ATKSystem` manages.
/// This factory also supports meta-transactions through OpenZeppelin's `ERC2771Context`, allowing users to interact
/// with it (e.g., to create a new `ATKSystem`) without paying for gas directly, provided a trusted forwarder is used.
/// The factory keeps track of all `ATKSystem` instances it creates.
contract ATKSystemFactory is IATKSystemFactory, ERC2771Context {
    // --- State Variables ---
    // Immutable variables are set once at construction and cannot be changed later, saving gas.

    /// @notice The address of the ATKSystem implementation contract.
    address public immutable ATK_SYSTEM_IMPLEMENTATION;

    /// @notice The default contract address for the system access manager module's logic.
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial system access manager
    /// implementation.
    address public immutable ATK_SYSTEM_ACCESS_MANAGER_IMPLEMENTATION;

    /// @notice The default contract address for the compliance module's logic (implementation).
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial compliance
    /// implementation.
    address public immutable DEFAULT_COMPLIANCE_IMPLEMENTATION;
    /// @notice The default contract address for the identity registry module's logic (implementation).
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial identity registry
    /// implementation.
    address public immutable DEFAULT_IDENTITY_REGISTRY_IMPLEMENTATION;
    /// @notice The default contract address for the identity registry storage module's logic (implementation).
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial identity registry
    /// storage implementation.
    address public immutable DEFAULT_IDENTITY_REGISTRY_STORAGE_IMPLEMENTATION;
    /// @notice The default contract address for the trusted issuers registry module's logic (implementation).
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial trusted issuers
    /// registry implementation.
    address public immutable DEFAULT_TRUSTED_ISSUERS_REGISTRY_IMPLEMENTATION;
    /// @notice The default contract address for the topic scheme registry module's logic (implementation).
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial topic scheme
    /// registry implementation.
    address public immutable DEFAULT_TOPIC_SCHEME_REGISTRY_IMPLEMENTATION;
    /// @notice The default contract address for the identity factory module's logic (implementation).
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial identity factory
    /// implementation.
    address public immutable DEFAULT_IDENTITY_FACTORY_IMPLEMENTATION;
    /// @notice The default contract address for the standard identity contract's logic (template/implementation).
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial standard identity
    /// implementation.
    address public immutable DEFAULT_IDENTITY_IMPLEMENTATION;
    /// @notice The default contract address for the contract identity contract's logic (template/implementation).
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial contract identity
    /// implementation.
    address public immutable DEFAULT_CONTRACT_IDENTITY_IMPLEMENTATION;
    /// @notice The default contract address for the token access manager contract's logic (implementation).
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial token access manager
    /// implementation.
    address public immutable DEFAULT_TOKEN_ACCESS_MANAGER_IMPLEMENTATION;
    /// @notice The address of the trusted forwarder contract used by this factory for meta-transactions (ERC2771).
    /// @dev This same forwarder address will also be passed to each new `ATKSystem` instance created by this factory,
    /// enabling them to support meta-transactions as well.
    address public immutable FACTORY_FORWARDER;
    /// @notice The default contract address for the compliance module registry module's logic.
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial compliance module
    /// registry implementation.
    address public immutable DEFAULT_COMPLIANCE_MODULE_REGISTRY_IMPLEMENTATION;
    /// @notice The default contract address for the addon registry module's logic.
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial addon registry
    /// implementation.
    address public immutable DEFAULT_ADDON_REGISTRY_IMPLEMENTATION;
    /// @notice The default contract address for the token factory registry module's logic.
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial token factory
    /// registry implementation.
    address public immutable DEFAULT_TOKEN_FACTORY_REGISTRY_IMPLEMENTATION;
    /// @notice The default contract address for the trusted issuers meta registry module's logic.
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial trusted issuers
    /// meta registry implementation.
    address public immutable DEFAULT_TRUSTED_ISSUERS_META_REGISTRY_IMPLEMENTATION;

    /// @notice An array storing the addresses of all `ATKSystem` instances that have been created by this factory.
    /// @dev This allows for easy tracking and retrieval of deployed systems.
    address[] public atkSystems;

    // --- Constructor ---

    /// @notice Constructs the `ATKSystemFactory` contract.
    /// @dev This function is called only once when the factory contract is deployed.
    /// It initializes the immutable default implementation addresses for all core ATK modules and sets the trusted
    /// forwarder address.
    /// It performs crucial checks to ensure that none of the provided implementation addresses are the zero address, as
    /// these are
    /// essential for the proper functioning of the `ATKSystem` instances that will be created.
    /// @param atkSystemImplementation_ The address of the ATKSystem implementation contract.
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
    /// @param contractIdentityImplementation_ The default address for the contract identity contract's logic
    /// (template).
    /// @param tokenAccessManagerImplementation_ The default address for the token access manager contract's logic
    /// (template).
    /// @param tokenFactoryRegistryImplementation_ The default address for the token factory registry module's logic
    /// contract.
    /// @param complianceModuleRegistryImplementation_ The default address for the compliance module registry module's
    /// logic contract.
    /// @param addonRegistryImplementation_ The default address for the addon registry module's logic contract.
    /// @param systemAccessManagerImplementation_ The default address for the system access manager module's logic
    /// contract.
    /// @param trustedIssuersMetaRegistryImplementation_ The default address for the trusted issuers meta registry
    /// module's logic contract.
    /// @param forwarder_ The address of the trusted forwarder contract to be used for meta-transactions (ERC2771).
    constructor(
        address atkSystemImplementation_,
        address complianceImplementation_,
        address identityRegistryImplementation_,
        address identityRegistryStorageImplementation_,
        address trustedIssuersRegistryImplementation_,
        address topicSchemeRegistryImplementation_,
        address identityFactoryImplementation_,
        address identityImplementation_,
        address contractIdentityImplementation_,
        address tokenAccessManagerImplementation_,
        address tokenFactoryRegistryImplementation_,
        address complianceModuleRegistryImplementation_,
        address addonRegistryImplementation_,
        address systemAccessManagerImplementation_,
        address trustedIssuersMetaRegistryImplementation_,
        address forwarder_
    )
        ERC2771Context(forwarder_) // Initializes ERC2771 support with the provided forwarder address.
    {
        // Perform critical checks: ensure no implementation address is the zero address.
        // Reverting here prevents deploying a factory that would create non-functional ATKSystem instances.
        if (atkSystemImplementation_ == address(0)) revert InvalidSystemImplementation();
        if (complianceImplementation_ == address(0)) revert ComplianceImplementationNotSet();
        if (identityRegistryImplementation_ == address(0)) revert IdentityRegistryImplementationNotSet();
        if (identityRegistryStorageImplementation_ == address(0)) revert IdentityRegistryStorageImplementationNotSet();
        if (trustedIssuersRegistryImplementation_ == address(0)) revert TrustedIssuersRegistryImplementationNotSet();
        if (topicSchemeRegistryImplementation_ == address(0)) revert TopicSchemeRegistryImplementationNotSet();
        if (identityFactoryImplementation_ == address(0)) revert IdentityFactoryImplementationNotSet();
        if (identityImplementation_ == address(0)) revert IdentityImplementationNotSet();
        if (contractIdentityImplementation_ == address(0)) revert ContractIdentityImplementationNotSet();
        if (tokenAccessManagerImplementation_ == address(0)) revert TokenAccessManagerImplementationNotSet();
        if (tokenFactoryRegistryImplementation_ == address(0)) revert TokenFactoryRegistryImplementationNotSet();
        if (complianceModuleRegistryImplementation_ == address(0)) {
            revert ComplianceModuleRegistryImplementationNotSet();
        }
        if (addonRegistryImplementation_ == address(0)) revert AddonRegistryImplementationNotSet();
        if (systemAccessManagerImplementation_ == address(0)) revert SystemAccessManagerImplementationNotSet();
        if (trustedIssuersMetaRegistryImplementation_ == address(0)) {
            revert TrustedIssuersMetaRegistryImplementationNotSet();
        }

        // Set the immutable state variables with the provided addresses.
        ATK_SYSTEM_IMPLEMENTATION = atkSystemImplementation_;
        ATK_SYSTEM_ACCESS_MANAGER_IMPLEMENTATION = systemAccessManagerImplementation_;

        DEFAULT_COMPLIANCE_IMPLEMENTATION = complianceImplementation_;
        DEFAULT_IDENTITY_REGISTRY_IMPLEMENTATION = identityRegistryImplementation_;
        DEFAULT_IDENTITY_REGISTRY_STORAGE_IMPLEMENTATION = identityRegistryStorageImplementation_;
        DEFAULT_TRUSTED_ISSUERS_REGISTRY_IMPLEMENTATION = trustedIssuersRegistryImplementation_;
        DEFAULT_TOPIC_SCHEME_REGISTRY_IMPLEMENTATION = topicSchemeRegistryImplementation_;
        DEFAULT_IDENTITY_FACTORY_IMPLEMENTATION = identityFactoryImplementation_;
        DEFAULT_IDENTITY_IMPLEMENTATION = identityImplementation_;
        DEFAULT_CONTRACT_IDENTITY_IMPLEMENTATION = contractIdentityImplementation_;
        DEFAULT_TOKEN_ACCESS_MANAGER_IMPLEMENTATION = tokenAccessManagerImplementation_;
        DEFAULT_TOKEN_FACTORY_REGISTRY_IMPLEMENTATION = tokenFactoryRegistryImplementation_;
        DEFAULT_COMPLIANCE_MODULE_REGISTRY_IMPLEMENTATION = complianceModuleRegistryImplementation_;
        DEFAULT_ADDON_REGISTRY_IMPLEMENTATION = addonRegistryImplementation_;
        DEFAULT_TRUSTED_ISSUERS_META_REGISTRY_IMPLEMENTATION = trustedIssuersMetaRegistryImplementation_;

        FACTORY_FORWARDER = forwarder_; // Store the forwarder address for use by this factory and new systems.
    }

    // --- Public Functions ---

    /// @notice Creates and deploys a new `ATKSystem` instance using the factory's stored default implementation
    /// addresses.
    /// @dev When this function is called, a new `ATKSystem` contract is created on the blockchain.
    /// The caller of this function (which is `_msgSender()`, resolving to the original user in an ERC2771
    /// meta-transaction context)
    /// will be set as the initial administrator (granted `DEFAULT_ADMIN_ROLE`) of the newly created `ATKSystem`.
    /// The new system's address is added to the `atkSystems` array for tracking, and a `ATKSystemCreated` event is
    /// emitted.
    /// @return systemAddress The blockchain address of the newly created `ATKSystem` contract.
    function createSystem() external returns (address systemAddress) {
        // Determine the initial admin for the new ATKSystem.
        // _msgSender() correctly identifies the original user even if called via a trusted forwarder (ERC2771).
        address sender = _msgSender();

        // Deploy the ATKSystemAccessManagerProxy first, as other contracts need to reference it.
        address[] memory initialSystemAccessManagerAdmins = new address[](2);
        initialSystemAccessManagerAdmins[0] = sender;
        initialSystemAccessManagerAdmins[1] = address(this); // Grant the system contract admin role so it can grant
            // other roles during bootstrap
        bytes memory systemAccessManagerCallData = abi.encodeWithSelector(
            ATKSystemAccessManagerImplementation.initialize.selector, initialSystemAccessManagerAdmins
        );
        ERC1967Proxy systemAccessManagerProxy =
            new ERC1967Proxy(ATK_SYSTEM_ACCESS_MANAGER_IMPLEMENTATION, systemAccessManagerCallData);

        // Deploy a new ATKSystem contract instance.
        // It passes all the default implementation addresses stored in this factory, plus the factory's forwarder
        // address.
        bytes memory systemCallData = abi.encodeWithSelector(
            ATKSystemImplementation.initialize.selector,
            sender,
            systemAccessManagerProxy,
            DEFAULT_COMPLIANCE_IMPLEMENTATION,
            DEFAULT_IDENTITY_REGISTRY_IMPLEMENTATION,
            DEFAULT_IDENTITY_REGISTRY_STORAGE_IMPLEMENTATION,
            DEFAULT_TRUSTED_ISSUERS_REGISTRY_IMPLEMENTATION,
            DEFAULT_TOPIC_SCHEME_REGISTRY_IMPLEMENTATION,
            DEFAULT_IDENTITY_FACTORY_IMPLEMENTATION,
            DEFAULT_IDENTITY_IMPLEMENTATION,
            DEFAULT_CONTRACT_IDENTITY_IMPLEMENTATION,
            DEFAULT_TOKEN_ACCESS_MANAGER_IMPLEMENTATION,
            DEFAULT_TOKEN_FACTORY_REGISTRY_IMPLEMENTATION,
            DEFAULT_COMPLIANCE_MODULE_REGISTRY_IMPLEMENTATION,
            DEFAULT_ADDON_REGISTRY_IMPLEMENTATION,
            DEFAULT_TRUSTED_ISSUERS_META_REGISTRY_IMPLEMENTATION
        );

        ERC1967Proxy systemProxy = new ERC1967Proxy(ATK_SYSTEM_IMPLEMENTATION, systemCallData);

        // Get the address of the newly deployed contract.
        systemAddress = address(systemProxy);
        // Add the new system's address to our tracking array.
        atkSystems.push(systemAddress);

        // Grant the initial admin the default admin, deployer, and implementation manager roles.
        bytes32[] memory senderRoles = new bytes32[](2);
        senderRoles[0] = ATKRoles.DEFAULT_ADMIN_ROLE;
        senderRoles[1] = ATKPeopleRoles.SYSTEM_MANAGER_ROLE;
        IATKSystemAccessManager(address(systemAccessManagerProxy)).grantMultipleRoles(sender, senderRoles);

        bytes32[] memory systemRoles = new bytes32[](2);
        systemRoles[0] = ATKRoles.DEFAULT_ADMIN_ROLE; // needs to be able to grant roles to system modules
        systemRoles[1] = ATKSystemRoles.SYSTEM_MODULE_ROLE;
        IATKSystemAccessManager(address(systemAccessManagerProxy)).grantMultipleRoles(systemAddress, systemRoles);

        // Emit an event to log the creation, including the new system's address and its initial admin.
        emit ATKSystemCreated(sender, systemAddress, address(systemAccessManagerProxy));

        // Return the address of the newly created system.
        return systemAddress;
    }

    /// @notice Gets the total number of `ATKSystem` instances that have been created by this factory.
    /// @dev This is a view function, meaning it only reads blockchain state and does not cost gas to call (if called
    /// externally, not in a transaction).
    /// @return uint256 The count of `ATKSystem` instances currently stored in the `atkSystems` array.
    function getSystemCount() external view returns (uint256) {
        return atkSystems.length;
    }

    /// @notice Gets the blockchain address of a `ATKSystem` instance at a specific index in the list of created
    /// systems.
    /// @dev This allows retrieval of addresses for previously deployed `ATKSystem` contracts.
    /// It will revert with an `IndexOutOfBounds` error if the provided `index` is greater than or equal to the
    /// current number of created systems (i.e., if `index >= atkSystems.length`).
    /// This is a view function.
    /// @param index The zero-based index of the desired `ATKSystem` in the `atkSystems` array.
    /// @return address The blockchain address of the `ATKSystem` contract found at the given `index`.
    function getSystemAtIndex(uint256 index) external view returns (address) {
        // Check for valid index to prevent errors.
        // solhint-disable-next-line gas-strict-inequalities
        if (atkSystems.length == 0 || index >= atkSystems.length) revert IndexOutOfBounds(index, atkSystems.length);
        return atkSystems[index];
    }

    /// @notice Returns the default compliance implementation address
    /// @return The address of the default compliance implementation
    function defaultComplianceImplementation() external view returns (address) {
        return DEFAULT_COMPLIANCE_IMPLEMENTATION;
    }

    /// @notice Returns the default identity registry implementation address
    /// @return The address of the default identity registry implementation
    function defaultIdentityRegistryImplementation() external view returns (address) {
        return DEFAULT_IDENTITY_REGISTRY_IMPLEMENTATION;
    }

    /// @notice Returns the default identity registry storage implementation address
    /// @return The address of the default identity registry storage implementation
    function defaultIdentityRegistryStorageImplementation() external view returns (address) {
        return DEFAULT_IDENTITY_REGISTRY_STORAGE_IMPLEMENTATION;
    }

    /// @notice Returns the default trusted issuers registry implementation address
    /// @return The address of the default trusted issuers registry implementation
    function defaultTrustedIssuersRegistryImplementation() external view returns (address) {
        return DEFAULT_TRUSTED_ISSUERS_REGISTRY_IMPLEMENTATION;
    }

    /// @notice Returns the default topic scheme registry implementation address
    /// @return The address of the default topic scheme registry implementation
    function defaultTopicSchemeRegistryImplementation() external view returns (address) {
        return DEFAULT_TOPIC_SCHEME_REGISTRY_IMPLEMENTATION;
    }

    /// @notice Returns the default identity factory implementation address
    /// @return The address of the default identity factory implementation
    function defaultIdentityFactoryImplementation() external view returns (address) {
        return DEFAULT_IDENTITY_FACTORY_IMPLEMENTATION;
    }

    /// @notice Returns the default identity implementation address
    /// @return The address of the default identity implementation
    function defaultIdentityImplementation() external view returns (address) {
        return DEFAULT_IDENTITY_IMPLEMENTATION;
    }

    /// @notice Returns the default contract identity implementation address
    /// @return The address of the default contract identity implementation
    function defaultContractIdentityImplementation() external view returns (address) {
        return DEFAULT_CONTRACT_IDENTITY_IMPLEMENTATION;
    }

    /// @notice Returns the default token access manager implementation address
    /// @return The address of the default token access manager implementation
    function defaultTokenAccessManagerImplementation() external view returns (address) {
        return DEFAULT_TOKEN_ACCESS_MANAGER_IMPLEMENTATION;
    }

    /// @notice Returns the factory forwarder address
    /// @return The address of the factory forwarder
    function factoryForwarder() external view returns (address) {
        return FACTORY_FORWARDER;
    }
}
