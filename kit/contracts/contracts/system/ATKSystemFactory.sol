// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKSystemImplementation } from "./ATKSystemImplementation.sol";
import { IATKSystemFactory } from "./IATKSystemFactory.sol";
import {
    ComplianceImplementationNotSet,
    IdentityRegistryImplementationNotSet,
    IdentityRegistryStorageImplementationNotSet,
    SystemTrustedIssuersRegistryImplementationNotSet,
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
    InvalidSystemImplementation,
    InvalidComplianceModuleAddress
} from "./ATKSystemErrors.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { ATKSystemAccessManagerImplementation } from "./access-manager/ATKSystemAccessManagerImplementation.sol";
import { IATKSystemAccessManager } from "./access-manager/IATKSystemAccessManager.sol";
import { ATKPeopleRoles } from "./ATKPeopleRoles.sol";
import { ATKRoles } from "./ATKRoles.sol";
import { ATKSystemRoles } from "./ATKSystemRoles.sol";
import { IATKSystem } from "./IATKSystem.sol";

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
    address public immutable DEFAULT_SYSTEM_TRUSTED_ISSUERS_REGISTRY_IMPLEMENTATION;
    /// @notice The default contract address for the trusted issuers meta registry module's logic.
    /// @dev This address will be passed to newly created `ATKSystem` instances as the initial trusted issuers
    /// meta registry implementation.
    address public immutable DEFAULT_TRUSTED_ISSUERS_META_REGISTRY_IMPLEMENTATION;
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
    /// @notice The default identity verification compliance module to register globally on each system at bootstrap.
    /// @dev This is a module (not an implementation), expected to implement ISMARTComplianceModule.
    address public immutable DEFAULT_IDENTITY_VERIFICATION_COMPLIANCE_MODULE;

    /// @notice An array storing the addresses of all `ATKSystem` instances that have been created by this factory.
    /// @dev This allows for easy tracking and retrieval of deployed systems.
    address[] public atkSystems;

    /// @notice Struct collecting all system implementation addresses for constructor input.
    struct SystemImplementations {
        address atkSystemImplementation;
        address complianceImplementation;
        address identityRegistryImplementation;
        address identityRegistryStorageImplementation;
        address systemTrustedIssuersRegistryImplementation;
        address trustedIssuersMetaRegistryImplementation;
        address topicSchemeRegistryImplementation;
        address identityFactoryImplementation;
        address identityImplementation;
        address contractIdentityImplementation;
        address tokenAccessManagerImplementation;
        address tokenFactoryRegistryImplementation;
        address complianceModuleRegistryImplementation;
        address addonRegistryImplementation;
        address systemAccessManagerImplementation;
        address identityVerificationComplianceModule;
    }

    // --- Constructor ---

    /// @notice Constructs the `ATKSystemFactory` contract.
    /// @dev This function is called only once when the factory contract is deployed.
    /// It initializes the immutable default implementation addresses for all core ATK modules and sets the trusted
    /// forwarder address.
    /// It performs crucial checks to ensure that none of the provided implementation addresses are the zero address, as
    /// these are
    /// essential for the proper functioning of the `ATKSystem` instances that will be created.
    /// @param implementations The struct containing all implementation addresses required by the system.
    /// @param forwarder_ The address of the trusted forwarder contract to be used for meta-transactions (ERC2771).
    constructor(
        SystemImplementations memory implementations,
        address forwarder_
    )
        ERC2771Context(forwarder_) // Initializes ERC2771 support with the provided forwarder address.
    {
        // Perform critical checks: ensure no implementation address is the zero address.
        // Reverting here prevents deploying a factory that would create non-functional ATKSystem instances.
        if (implementations.atkSystemImplementation == address(0)) revert InvalidSystemImplementation();
        if (implementations.complianceImplementation == address(0)) revert ComplianceImplementationNotSet();
        if (implementations.identityRegistryImplementation == address(0)) {
            revert IdentityRegistryImplementationNotSet();
        }
        if (implementations.identityRegistryStorageImplementation == address(0)) {
            revert IdentityRegistryStorageImplementationNotSet();
        }
        if (implementations.systemTrustedIssuersRegistryImplementation == address(0)) {
            revert SystemTrustedIssuersRegistryImplementationNotSet();
        }
        if (implementations.topicSchemeRegistryImplementation == address(0)) {
            revert TopicSchemeRegistryImplementationNotSet();
        }
        if (implementations.identityFactoryImplementation == address(0)) revert IdentityFactoryImplementationNotSet();
        if (implementations.identityImplementation == address(0)) revert IdentityImplementationNotSet();
        if (implementations.contractIdentityImplementation == address(0)) {
            revert ContractIdentityImplementationNotSet();
        }
        if (implementations.tokenAccessManagerImplementation == address(0)) {
            revert TokenAccessManagerImplementationNotSet();
        }
        if (implementations.tokenFactoryRegistryImplementation == address(0)) {
            revert TokenFactoryRegistryImplementationNotSet();
        }
        if (implementations.complianceModuleRegistryImplementation == address(0)) {
            revert ComplianceModuleRegistryImplementationNotSet();
        }
        if (implementations.addonRegistryImplementation == address(0)) revert AddonRegistryImplementationNotSet();
        if (implementations.systemAccessManagerImplementation == address(0)) {
            revert SystemAccessManagerImplementationNotSet();
        }
        if (implementations.trustedIssuersMetaRegistryImplementation == address(0)) {
            revert TrustedIssuersMetaRegistryImplementationNotSet();
        }
        if (implementations.identityVerificationComplianceModule == address(0)) {
            revert InvalidComplianceModuleAddress();
        }

        // Set the immutable state variables with the provided addresses.
        ATK_SYSTEM_IMPLEMENTATION = implementations.atkSystemImplementation;
        ATK_SYSTEM_ACCESS_MANAGER_IMPLEMENTATION = implementations.systemAccessManagerImplementation;

        DEFAULT_COMPLIANCE_IMPLEMENTATION = implementations.complianceImplementation;
        DEFAULT_IDENTITY_REGISTRY_IMPLEMENTATION = implementations.identityRegistryImplementation;
        DEFAULT_IDENTITY_REGISTRY_STORAGE_IMPLEMENTATION = implementations.identityRegistryStorageImplementation;
        DEFAULT_SYSTEM_TRUSTED_ISSUERS_REGISTRY_IMPLEMENTATION =
            implementations.systemTrustedIssuersRegistryImplementation;
        DEFAULT_TOPIC_SCHEME_REGISTRY_IMPLEMENTATION = implementations.topicSchemeRegistryImplementation;
        DEFAULT_IDENTITY_FACTORY_IMPLEMENTATION = implementations.identityFactoryImplementation;
        DEFAULT_IDENTITY_IMPLEMENTATION = implementations.identityImplementation;
        DEFAULT_CONTRACT_IDENTITY_IMPLEMENTATION = implementations.contractIdentityImplementation;
        DEFAULT_TOKEN_ACCESS_MANAGER_IMPLEMENTATION = implementations.tokenAccessManagerImplementation;
        DEFAULT_TOKEN_FACTORY_REGISTRY_IMPLEMENTATION = implementations.tokenFactoryRegistryImplementation;
        DEFAULT_COMPLIANCE_MODULE_REGISTRY_IMPLEMENTATION = implementations.complianceModuleRegistryImplementation;
        DEFAULT_ADDON_REGISTRY_IMPLEMENTATION = implementations.addonRegistryImplementation;
        DEFAULT_TRUSTED_ISSUERS_META_REGISTRY_IMPLEMENTATION = implementations.trustedIssuersMetaRegistryImplementation;
        DEFAULT_IDENTITY_VERIFICATION_COMPLIANCE_MODULE = implementations.identityVerificationComplianceModule;

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
        IATKSystem.SystemInitImplementations memory initImpls = IATKSystem.SystemInitImplementations({
            complianceImplementation: DEFAULT_COMPLIANCE_IMPLEMENTATION,
            identityRegistryImplementation: DEFAULT_IDENTITY_REGISTRY_IMPLEMENTATION,
            identityRegistryStorageImplementation: DEFAULT_IDENTITY_REGISTRY_STORAGE_IMPLEMENTATION,
            trustedIssuersRegistryImplementation: DEFAULT_SYSTEM_TRUSTED_ISSUERS_REGISTRY_IMPLEMENTATION,
            trustedIssuersMetaRegistryImplementation: DEFAULT_TRUSTED_ISSUERS_META_REGISTRY_IMPLEMENTATION,
            topicSchemeRegistryImplementation: DEFAULT_TOPIC_SCHEME_REGISTRY_IMPLEMENTATION,
            identityFactoryImplementation: DEFAULT_IDENTITY_FACTORY_IMPLEMENTATION,
            identityImplementation: DEFAULT_IDENTITY_IMPLEMENTATION,
            contractIdentityImplementation: DEFAULT_CONTRACT_IDENTITY_IMPLEMENTATION,
            tokenAccessManagerImplementation: DEFAULT_TOKEN_ACCESS_MANAGER_IMPLEMENTATION,
            tokenFactoryRegistryImplementation: DEFAULT_TOKEN_FACTORY_REGISTRY_IMPLEMENTATION,
            complianceModuleRegistryImplementation: DEFAULT_COMPLIANCE_MODULE_REGISTRY_IMPLEMENTATION,
            addonRegistryImplementation: DEFAULT_ADDON_REGISTRY_IMPLEMENTATION,
            identityVerificationComplianceModule: DEFAULT_IDENTITY_VERIFICATION_COMPLIANCE_MODULE
        });

        bytes memory systemCallData = abi.encodeWithSelector(
            ATKSystemImplementation.initialize.selector, sender, address(systemAccessManagerProxy), initImpls
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
    function defaultSystemTrustedIssuersRegistryImplementation() external view returns (address) {
        return DEFAULT_SYSTEM_TRUSTED_ISSUERS_REGISTRY_IMPLEMENTATION;
    }

    /// @notice Returns the default trusted issuers meta registry implementation address
    /// @return The address of the default trusted issuers meta registry implementation
    function defaultTrustedIssuersMetaRegistryImplementation() external view returns (address) {
        return DEFAULT_TRUSTED_ISSUERS_META_REGISTRY_IMPLEMENTATION;
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

    /// @notice Returns the default identity verification compliance module address
    /// @return The address of the default identity verification compliance module
    function defaultIdentityVerificationComplianceModule() external view returns (address) {
        return DEFAULT_IDENTITY_VERIFICATION_COMPLIANCE_MODULE;
    }
}
