// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {
    ERC2771ContextUpgradeable,
    ContextUpgradeable
} from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { IATKSystem } from "./IATKSystem.sol";
import {
    ComplianceImplementationNotSet,
    ContractIdentityImplementationNotSet,
    IdentityFactoryImplementationNotSet,
    IdentityImplementationNotSet,
    IdentityRegistryImplementationNotSet,
    IdentityRegistryStorageImplementationNotSet,
    IdentityVerificationModuleNotSet,
    InvalidImplementationInterface,
    SystemAccessManagerImplementationNotSet,
    SystemAlreadyBootstrapped,
    TokenAccessManagerImplementationNotSet,
    TopicSchemeRegistryImplementationNotSet,
    TrustedIssuersRegistryImplementationNotSet,
    ComplianceModuleRegistryImplementationNotSet,
    AddonRegistryImplementationNotSet,
    TokenFactoryRegistryImplementationNotSet
} from "./ATKSystemErrors.sol";
import { ATKTypedImplementationProxy } from "./ATKTypedImplementationProxy.sol";

// Compliance modules
import { ISMARTComplianceModule } from "../smart/interface/ISMARTComplianceModule.sol";

// Constants
import { ATKSystemRoles } from "./ATKSystemRoles.sol";
import { ATKTopics } from "./ATKTopics.sol";

// Interface imports
import { IATKTypedImplementationRegistry } from "./IATKTypedImplementationRegistry.sol";
import { IATKIdentityFactory } from "./identity-factory/IATKIdentityFactory.sol";
import { ISMARTTokenAccessManager } from "../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { IATKComplianceModuleRegistry } from "./compliance/IATKComplianceModuleRegistry.sol";
import { IATKTokenFactoryRegistry } from "./token-factory/IATKTokenFactoryRegistry.sol";
import { IATKIdentityRegistry } from "./identity-registry/IATKIdentityRegistry.sol";
import { IATKTrustedIssuersRegistry } from "./trusted-issuers-registry/IATKTrustedIssuersRegistry.sol";
import { IATKTopicSchemeRegistry } from "./topic-scheme-registry/IATKTopicSchemeRegistry.sol";
import { IATKCompliance } from "./compliance/IATKCompliance.sol";
import { IATKIdentityRegistryStorage } from "./identity-registry-storage/IATKIdentityRegistryStorage.sol";
import { IATKSystemAddonRegistry } from "./addons/IATKSystemAddonRegistry.sol";
import { IATKSystemAccessManager } from "./access-manager/IATKSystemAccessManager.sol";
import { ATKSystemAccessManagerImplementation } from "./access-manager/ATKSystemAccessManagerImplementation.sol";

/// @title ATKSystem Contract
/// @author SettleMint Tokenization Services
/// @notice This is the main contract for managing the ATK Protocol system components, their implementations (logic
/// contracts),
/// and their proxies. It acts as a central registry and control point for the entire protocol.
/// @dev This contract handles the deployment of proxy contracts for various modules (like Compliance, Identity
/// Registry, etc.)
/// and manages the addresses of their underlying implementation (logic) contracts. This allows for system upgrades
/// by changing the implementation address without altering the stable proxy addresses that other contracts interact
/// with.
/// It uses OpenZeppelin's ERC2771Context for meta-transaction support (allowing gasless transactions for users if a
/// trusted forwarder is used) and AccessControl for role-based permissions (restricting sensitive functions to
/// authorized
/// administrators). It also inherits ReentrancyGuard to protect against reentrancy attacks on certain functions.
/// @dev If this contract's size becomes a concern, the management of token factories, system addons, and compliance
/// modules could be refactored into separate, bootstrapped registry contracts to improve modularity.
contract ATKSystemImplementation is
    Initializable,
    IATKSystem,
    IATKTypedImplementationRegistry,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // --- Module Type Hashes ---
    bytes32 internal constant COMPLIANCE = keccak256("COMPLIANCE");
    bytes32 internal constant IDENTITY_REGISTRY = keccak256("IDENTITY_REGISTRY");
    bytes32 internal constant IDENTITY_REGISTRY_STORAGE = keccak256("IDENTITY_REGISTRY_STORAGE");
    bytes32 internal constant TRUSTED_ISSUERS_REGISTRY = keccak256("TRUSTED_ISSUERS_REGISTRY");
    bytes32 internal constant TOPIC_SCHEME_REGISTRY = keccak256("TOPIC_SCHEME_REGISTRY");
    bytes32 internal constant IDENTITY_FACTORY = keccak256("IDENTITY_FACTORY");
    bytes32 internal constant TOKEN_ACCESS_MANAGER = keccak256("TOKEN_ACCESS_MANAGER");
    bytes32 internal constant IDENTITY = keccak256("IDENTITY");
    bytes32 internal constant CONTRACT_IDENTITY = keccak256("CONTRACT_IDENTITY");
    bytes32 internal constant COMPLIANCE_MODULE_REGISTRY = keccak256("COMPLIANCE_MODULE_REGISTRY");
    bytes32 internal constant ADDON_REGISTRY = keccak256("ADDON_REGISTRY");
    bytes32 internal constant TOKEN_FACTORY_REGISTRY = keccak256("TOKEN_FACTORY_REGISTRY");
    bytes32 internal constant SYSTEM_ACCESS_MANAGER = keccak256("SYSTEM_ACCESS_MANAGER");

    // Expected interface IDs used for validating implementation contracts.
    // These are unique identifiers for Solidity interfaces, ensuring that a contract claiming to be, for example,
    // an ISMARTCompliance implementation actually supports the functions defined in that interface.
    bytes4 private constant _SYSTEM_ID = type(IATKSystem).interfaceId;
    bytes4 private constant _COMPLIANCE_ID = type(IATKCompliance).interfaceId;
    bytes4 private constant _IDENTITY_REGISTRY_ID = type(IATKIdentityRegistry).interfaceId;
    bytes4 private constant _IDENTITY_REGISTRY_STORAGE_ID = type(IATKIdentityRegistryStorage).interfaceId;
    bytes4 private constant _TRUSTED_ISSUERS_REGISTRY_ID = type(IATKTrustedIssuersRegistry).interfaceId;
    bytes4 private constant _TOPIC_SCHEME_REGISTRY_ID = type(IATKTopicSchemeRegistry).interfaceId;
    bytes4 private constant _IDENTITY_FACTORY_ID = type(IATKIdentityFactory).interfaceId;
    bytes4 private constant _IDENTITY_ID = type(IIdentity).interfaceId;
    bytes4 private constant _TOKEN_ACCESS_MANAGER_ID = type(ISMARTTokenAccessManager).interfaceId;
    bytes4 private constant _COMPLIANCE_MODULE_ID = type(ISMARTComplianceModule).interfaceId;
    bytes4 private constant _COMPLIANCE_MODULE_REGISTRY_ID = type(IATKComplianceModuleRegistry).interfaceId;
    bytes4 private constant _ADDON_REGISTRY_ID = type(IATKSystemAddonRegistry).interfaceId;
    bytes4 private constant _TOKEN_FACTORY_REGISTRY_ID = type(IATKTokenFactoryRegistry).interfaceId;
    bytes4 private constant _IIDENTITY_ID = type(IIdentity).interfaceId;
    bytes4 private constant _SYSTEM_ACCESS_MANAGER_ID = type(IATKSystemAccessManager).interfaceId;

    // --- State Variables ---
    // State variables store data persistently on the blockchain.

    mapping(bytes32 => address) private _implementations;

    // Addresses for the compliance module: one for the logic, one for the proxy.
    /// @dev Stores the address of the compliance module's proxy contract.
    address private _complianceProxy;

    // Addresses for the identity registry module.
    /// @dev Stores the address of the identity registry module's proxy contract.
    address private _identityRegistryProxy;

    // Addresses for the identity registry storage module.
    /// @dev Stores the address of the identity registry storage module's proxy contract.
    address private _identityRegistryStorageProxy;

    // Addresses for the trusted issuers registry module.
    /// @dev Stores the address of the trusted issuers registry module's proxy contract.
    address private _trustedIssuersRegistryProxy;

    // Addresses for the topic scheme registry module.
    /// @dev Stores the address of the topic scheme registry module's proxy contract.
    address private _topicSchemeRegistryProxy;

    // Addresses for the identity factory module.
    /// @dev Stores the address of the identity factory module's proxy contract.
    address private _identityFactoryProxy;

    /// @dev Stores the address of the current identity verification module instance.
    address private _identityVerificationModule;

    /// @dev Flag to indicate if the system has been bootstrapped.
    bool private _bootstrapped;

    /// @dev Stores the address of the compliance module registry proxy contract.
    address private _complianceModuleRegistryProxy;

    /// @dev Stores the address of the addon registry proxy contract.
    address private _addonRegistryProxy;

    /// @dev Stores the address of the token factory registry proxy contract.
    address private _tokenFactoryRegistryProxy;

    /// @dev Stores the address of the system access manager proxy contract.
    address private _systemAccessManagerProxy;

    // --- Internal Helper for Interface Check ---
    /// @notice Internal helper function to check if a given contract address supports a specific interface
    /// @dev Internal helper function to check if a given contract address (`implAddress`)
    /// supports a specific interface (`interfaceId`) using ERC165 introspection.
    /// ERC165 is a standard for publishing and detecting what interfaces a smart contract implements.
    /// @param implAddress The address of the contract to check
    /// @param interfaceId The 4-byte identifier of the interface to check for support
    function _checkInterface(address implAddress, bytes4 interfaceId) private view {
        // Allow zero address to pass here; specific `NotSet` errors are thrown elsewhere if an address is required but
        // zero.
        if (implAddress == address(0)) return;
        try IERC165(implAddress).supportsInterface(interfaceId) returns (bool supported) {
            if (!supported) {
                // If the contract does not support the interface, revert with a specific error.
                revert InvalidImplementationInterface(implAddress, interfaceId);
            }
        } catch {
            // If the call to supportsInterface itself fails (e.g., `implAddress` is not a contract or doesn't implement
            // IERC165),
            // also revert with the same error.
            revert InvalidImplementationInterface(implAddress, interfaceId);
        }
    }

    /// @notice Constructor that disables initialization of the implementation contract
    /// @dev Uses OpenZeppelin's oz-upgrades-unsafe-allow pattern to prevent the implementation from being initialized
    /// @param forwarder_ The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder_) ERC2771ContextUpgradeable(forwarder_) {
        _disableInitializers();
    }

    /// @notice Initializes the ATKSystem contract.
    /// @dev Sets up the initial administrator, validates and stores the initial implementation addresses for all
    /// modules
    /// and identity types, and sets the trusted forwarder for meta-transactions.
    /// It performs interface checks on all provided implementation addresses to ensure they conform to the required
    /// standards.
    /// @param initialAdmin_ The address that will be granted the `DEFAULT_ADMIN_ROLE`, giving it administrative control
    /// over this contract.
    /// @param complianceImplementation_ The initial address of the compliance module's logic contract.
    /// @param identityRegistryImplementation_ The initial address of the identity registry module's logic contract.
    /// @param identityRegistryStorageImplementation_ The initial address of the identity registry storage module's
    /// logic contract.
    /// @param trustedIssuersRegistryImplementation_ The initial address of the trusted issuers registry module's logic
    /// contract.
    /// @param topicSchemeRegistryImplementation_ The initial address of the topic scheme registry module's logic
    /// contract.
    /// @param identityFactoryImplementation_ The initial address of the identity factory module's logic contract.
    /// @param identityImplementation_ The initial address of the standard identity contract's logic (template). Must be
    /// IERC734/IIdentity compliant.
    /// @param contractIdentityImplementation_ The initial address of the contract identity contract's logic (template).
    /// Must be
    /// IERC734/IIdentity compliant.
    /// @param tokenAccessManagerImplementation_ The initial address of the token access manager contract's logic. Must
    /// be ISMARTTokenAccessManager compliant.
    /// @param identityVerificationModule_ The initial address of the identity verification module
    /// contract's logic.
    /// @param tokenFactoryRegistryImplementation_ The initial address of the token factory registry module's logic
    /// contract.
    /// @param complianceModuleRegistryImplementation_ The initial address of the compliance module registry module's
    /// logic contract.
    /// @param addonRegistryImplementation_ The initial address of the addon registry module's logic contract.
    /// @param systemAccessManagerImplementation_ The initial address of the system access manager module's logic
    /// contract.
    function initialize(
        address initialAdmin_,
        address complianceImplementation_,
        address identityRegistryImplementation_,
        address identityRegistryStorageImplementation_,
        address trustedIssuersRegistryImplementation_,
        address topicSchemeRegistryImplementation_,
        address identityFactoryImplementation_,
        address identityImplementation_, // Expected to be IERC734/IIdentity compliant
        address contractIdentityImplementation_, // Expected to be IERC734/IIdentity compliant
        address tokenAccessManagerImplementation_, // Expected to be ISMARTTokenAccessManager compliant
        address identityVerificationModule_,
        address tokenFactoryRegistryImplementation_,
        address complianceModuleRegistryImplementation_,
        address addonRegistryImplementation_,
        address systemAccessManagerImplementation_
    )
        public
        initializer
    {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        // Grant the DEFAULT_ADMIN_ROLE to the initial administrator address.
        // This role typically has permissions to call sensitive functions like setting implementation addresses.
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin_);
        _grantRole(ATKSystemRoles.DEPLOYER_ROLE, initialAdmin_);
        _grantRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE, initialAdmin_);

        // Validate and set the compliance implementation address.
        if (complianceImplementation_ == address(0)) revert ComplianceImplementationNotSet();
        _checkInterface(complianceImplementation_, _COMPLIANCE_ID); // Ensure it supports ISMARTCompliance
        _implementations[COMPLIANCE] = complianceImplementation_;
        emit ComplianceImplementationUpdated(initialAdmin_, complianceImplementation_);

        // Validate and set the identity registry implementation address.
        if (identityRegistryImplementation_ == address(0)) revert IdentityRegistryImplementationNotSet();
        _checkInterface(identityRegistryImplementation_, _IDENTITY_REGISTRY_ID); // Ensure it supports
            // ISMARTIdentityRegistry
        _implementations[IDENTITY_REGISTRY] = identityRegistryImplementation_;
        emit IdentityRegistryImplementationUpdated(initialAdmin_, identityRegistryImplementation_);

        // Validate and set the identity registry storage implementation address.
        if (identityRegistryStorageImplementation_ == address(0)) revert IdentityRegistryStorageImplementationNotSet();
        _checkInterface(identityRegistryStorageImplementation_, _IDENTITY_REGISTRY_STORAGE_ID); // Ensure it
            // supports ISMARTIdentityRegistryStorage
        _implementations[IDENTITY_REGISTRY_STORAGE] = identityRegistryStorageImplementation_;
        emit IdentityRegistryStorageImplementationUpdated(initialAdmin_, identityRegistryStorageImplementation_);

        // Validate and set the trusted issuers registry implementation address.
        if (trustedIssuersRegistryImplementation_ == address(0)) revert TrustedIssuersRegistryImplementationNotSet();
        _checkInterface(trustedIssuersRegistryImplementation_, _TRUSTED_ISSUERS_REGISTRY_ID); // Ensure it
            // supports IERC3643TrustedIssuersRegistry
        _implementations[TRUSTED_ISSUERS_REGISTRY] = trustedIssuersRegistryImplementation_;
        emit TrustedIssuersRegistryImplementationUpdated(initialAdmin_, trustedIssuersRegistryImplementation_);

        // Validate and set the topic scheme registry implementation address.
        if (topicSchemeRegistryImplementation_ == address(0)) revert TopicSchemeRegistryImplementationNotSet();
        _checkInterface(topicSchemeRegistryImplementation_, _TOPIC_SCHEME_REGISTRY_ID); // Ensure it supports
            // ISMARTTopicSchemeRegistry
        _implementations[TOPIC_SCHEME_REGISTRY] = topicSchemeRegistryImplementation_;
        emit TopicSchemeRegistryImplementationUpdated(initialAdmin_, topicSchemeRegistryImplementation_);

        // Validate and set the identity factory implementation address.
        if (identityFactoryImplementation_ == address(0)) revert IdentityFactoryImplementationNotSet();
        _checkInterface(identityFactoryImplementation_, _IDENTITY_FACTORY_ID); // Ensure it supports
            // IATKIdentityFactory
        _implementations[IDENTITY_FACTORY] = identityFactoryImplementation_;
        emit IdentityFactoryImplementationUpdated(initialAdmin_, identityFactoryImplementation_);

        // Validate and set the token access manager implementation address.
        if (tokenAccessManagerImplementation_ == address(0)) revert TokenAccessManagerImplementationNotSet();
        _checkInterface(tokenAccessManagerImplementation_, _TOKEN_ACCESS_MANAGER_ID); // Ensure it supports
            // ISMARTTokenAccessManager
        _implementations[TOKEN_ACCESS_MANAGER] = tokenAccessManagerImplementation_;
        emit TokenAccessManagerImplementationUpdated(initialAdmin_, tokenAccessManagerImplementation_);

        // Validate and set the standard identity implementation address.
        if (identityImplementation_ == address(0)) revert IdentityImplementationNotSet();
        _checkInterface(identityImplementation_, _IIDENTITY_ID); // Ensure it supports OnchainID's
            // IIdentity
        _implementations[IDENTITY] = identityImplementation_;
        emit IdentityImplementationUpdated(initialAdmin_, identityImplementation_);

        // Validate and set the contract identity implementation address.
        if (contractIdentityImplementation_ == address(0)) revert ContractIdentityImplementationNotSet();
        _checkInterface(contractIdentityImplementation_, _IIDENTITY_ID); // Ensure it supports OnchainID's
            // IIdentity
        _implementations[CONTRACT_IDENTITY] = contractIdentityImplementation_;
        emit ContractIdentityImplementationUpdated(initialAdmin_, contractIdentityImplementation_);

        // Validate and set the identity verification module implementation address.
        if (identityVerificationModule_ == address(0)) {
            revert IdentityVerificationModuleNotSet();
        }
        _identityVerificationModule = identityVerificationModule_;

        // Validate and set the compliance module registry implementation address.
        if (complianceModuleRegistryImplementation_ == address(0)) {
            revert ComplianceModuleRegistryImplementationNotSet();
        }
        _checkInterface(complianceModuleRegistryImplementation_, _COMPLIANCE_MODULE_REGISTRY_ID); // Ensure it
            // supports
            // ISMARTComplianceModuleRegistry
        _implementations[COMPLIANCE_MODULE_REGISTRY] = complianceModuleRegistryImplementation_;
        emit ComplianceModuleRegistryImplementationUpdated(initialAdmin_, complianceModuleRegistryImplementation_);

        // Validate and set the addon registry implementation address.
        if (addonRegistryImplementation_ == address(0)) revert AddonRegistryImplementationNotSet();
        _checkInterface(addonRegistryImplementation_, _ADDON_REGISTRY_ID); // Ensure it supports
            // ISMARTAddonRegistry
        _implementations[ADDON_REGISTRY] = addonRegistryImplementation_;
        emit SystemAddonRegistryImplementationUpdated(initialAdmin_, addonRegistryImplementation_);

        // Validate and set the token factory registry implementation address.
        if (tokenFactoryRegistryImplementation_ == address(0)) revert TokenFactoryRegistryImplementationNotSet();
        _checkInterface(tokenFactoryRegistryImplementation_, _TOKEN_FACTORY_REGISTRY_ID); // Ensure it supports
            // ISMARTTokenFactoryRegistry
        _implementations[TOKEN_FACTORY_REGISTRY] = tokenFactoryRegistryImplementation_;
        emit TokenFactoryRegistryImplementationUpdated(initialAdmin_, tokenFactoryRegistryImplementation_);

        // Validate and set the system access manager implementation address.
        if (systemAccessManagerImplementation_ == address(0)) revert SystemAccessManagerImplementationNotSet();
        _checkInterface(systemAccessManagerImplementation_, _SYSTEM_ACCESS_MANAGER_ID); // Ensure it supports
            // IATKSystemAccessManager
        _implementations[SYSTEM_ACCESS_MANAGER] = systemAccessManagerImplementation_;
        emit SystemAccessManagerImplementationUpdated(initialAdmin_, systemAccessManagerImplementation_);
    }

    /// @notice Authorizes an upgrade to a new implementation contract
    /// @dev Authorizes an upgrade to a new implementation contract.
    /// The UUPS upgrade mechanism is used.
    /// Only the `DEFAULT_ADMIN_ROLE` can authorize an upgrade.
    /// @param newImplementation The address of the new implementation contract
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) { }

    // --- Bootstrap Function ---
    /// @notice Deploys and initializes the proxy contracts for all core ATK modules.
    /// @dev This function is a critical step in setting up the ATKSystem. It should typically be called once by an
    /// admin
    /// after the `ATKSystem` contract itself is deployed and initial implementation addresses are set.
    /// It creates new instances of proxy contracts (e.g., `ATKComplianceProxy`, `ATKIdentityRegistryProxy`) and
    /// links them
    /// to this `ATKSystem` instance. It also performs necessary bindings between these proxies, such as linking the
    /// `IdentityRegistryStorageProxy` to the `IdentityRegistryProxy`.
    /// This function is protected by `onlyRole(DEFAULT_ADMIN_ROLE)` (meaning only admins can call it) and
    /// `nonReentrant`
    /// (preventing it from being called again while it's already executing, which guards against certain attacks).
    /// Reverts if any required implementation address (for compliance, identity registry, storage, trusted issuers,
    /// factory)
    /// is not set (i.e., is the zero address) before calling this function.
    function bootstrap() external nonReentrant onlyRole(ATKSystemRoles.DEPLOYER_ROLE) {
        // Check if system is already bootstrapped.
        if (_bootstrapped) {
            revert SystemAlreadyBootstrapped();
        }

        // Ensure all necessary implementation addresses are set before proceeding with proxy deployment.
        if (_implementations[COMPLIANCE] == address(0)) revert ComplianceImplementationNotSet();
        if (_implementations[IDENTITY_REGISTRY] == address(0)) revert IdentityRegistryImplementationNotSet();
        if (_implementations[IDENTITY_REGISTRY_STORAGE] == address(0)) {
            revert IdentityRegistryStorageImplementationNotSet();
        }
        if (_implementations[TRUSTED_ISSUERS_REGISTRY] == address(0)) {
            revert TrustedIssuersRegistryImplementationNotSet();
        }
        if (_implementations[TOPIC_SCHEME_REGISTRY] == address(0)) revert TopicSchemeRegistryImplementationNotSet();
        if (_implementations[IDENTITY_FACTORY] == address(0)) revert IdentityFactoryImplementationNotSet();
        if (_identityVerificationModule == address(0)) revert IdentityVerificationModuleNotSet();
        if (_implementations[COMPLIANCE_MODULE_REGISTRY] == address(0)) {
            revert ComplianceModuleRegistryImplementationNotSet();
        }
        if (_implementations[ADDON_REGISTRY] == address(0)) revert AddonRegistryImplementationNotSet();
        if (_implementations[TOKEN_FACTORY_REGISTRY] == address(0)) revert TokenFactoryRegistryImplementationNotSet();
        if (_implementations[SYSTEM_ACCESS_MANAGER] == address(0)) revert SystemAccessManagerImplementationNotSet();

        // The caller of this bootstrap function (who must be an admin) will also be set as the initial admin
        // for some of the newly deployed proxy contracts where applicable.
        address initialAdmin = _msgSender(); // _msgSender() correctly resolves the original caller in ERC2771 context.

        // --- Interactions (Part 1: Create proxy instances and store their addresses in local variables) ---
        // This follows the Checks-Effects-Interactions pattern where possible.
        // First, we create all new contract instances (interactions) and store their addresses in local variables.
        // This avoids reading from state that is being modified in the same transaction before it's fully updated.

        // Deploy registries
        address[] memory initialComplianceModuleAdmins = new address[](2);
        initialComplianceModuleAdmins[0] = initialAdmin;
        initialComplianceModuleAdmins[1] = address(this); // so we can add the identity verification module
        bytes memory complianceModuleRegistryData =
            abi.encodeWithSelector(IATKComplianceModuleRegistry.initialize.selector, initialComplianceModuleAdmins);
        address localComplianceModuleRegistryProxy = address(
            new ATKTypedImplementationProxy(address(this), COMPLIANCE_MODULE_REGISTRY, complianceModuleRegistryData)
        );

        // Deploy the ATKTokenFactoryRegistryProxy, linking it to this ATKSystem and setting an initial admin.
        bytes memory tokenFactoryRegistryData =
            abi.encodeWithSelector(IATKTokenFactoryRegistry.initialize.selector, initialAdmin, address(this));
        address localTokenFactoryRegistryProxy =
            address(new ATKTypedImplementationProxy(address(this), TOKEN_FACTORY_REGISTRY, tokenFactoryRegistryData));

        // Deploy the ATKSystemAddonRegistryProxy, linking it to this ATKSystem and setting an initial admin.
        bytes memory addonRegistryData =
            abi.encodeWithSelector(IATKSystemAddonRegistry.initialize.selector, initialAdmin, address(this));
        address localAddonRegistryProxy =
            address(new ATKTypedImplementationProxy(address(this), ADDON_REGISTRY, addonRegistryData));

        // Deploy the ATKComplianceProxy, linking it to this ATKSystem contract.
        address[] memory initialBypassListManagers = new address[](3);
        initialBypassListManagers[0] = initialAdmin;
        initialBypassListManagers[1] = localTokenFactoryRegistryProxy;
        initialBypassListManagers[2] = localAddonRegistryProxy;
        bytes memory complianceData =
            abi.encodeWithSelector(IATKCompliance.initialize.selector, initialAdmin, initialBypassListManagers);
        address localComplianceProxy =
            address(new ATKTypedImplementationProxy(address(this), COMPLIANCE, complianceData));

        // Deploy the ATKIdentityRegistryStorageProxy, linking it to this ATKSystem and setting an initial admin.
        bytes memory identityRegistryStorageData =
            abi.encodeWithSelector(IATKIdentityRegistryStorage.initialize.selector, address(this), initialAdmin);
        address localIdentityRegistryStorageProxy = address(
            new ATKTypedImplementationProxy(address(this), IDENTITY_REGISTRY_STORAGE, identityRegistryStorageData)
        );

        // Deploy the ATKTrustedIssuersRegistryProxy, linking it to this ATKSystem and setting an initial admin.
        bytes memory trustedIssuersRegistryData =
            abi.encodeWithSelector(IATKTrustedIssuersRegistry.initialize.selector, initialAdmin);
        address localTrustedIssuersRegistryProxy = address(
            new ATKTypedImplementationProxy(address(this), TRUSTED_ISSUERS_REGISTRY, trustedIssuersRegistryData)
        );

        // Deploy the ATKSystemAccessManagerProxy first, as other contracts need to reference it.
        address[] memory initialSystemAccessManagerAdmins = new address[](2);
        initialSystemAccessManagerAdmins[0] = initialAdmin;
        initialSystemAccessManagerAdmins[1] = address(this); // Grant the system contract admin role so it can grant other roles during bootstrap
        bytes memory systemAccessManagerData = abi.encodeWithSelector(
            ATKSystemAccessManagerImplementation.initialize.selector, initialSystemAccessManagerAdmins
        );
        address localSystemAccessManagerProxy =
            address(new ATKTypedImplementationProxy(address(this), SYSTEM_ACCESS_MANAGER, systemAccessManagerData));

        // Deploy the ATKTopicSchemeRegistryProxy, linking it to this ATKSystem and using the system access manager.
        bytes memory topicSchemeRegistryData =
            abi.encodeWithSelector(IATKTopicSchemeRegistry.initialize.selector, localSystemAccessManagerProxy);
        address localTopicSchemeRegistryProxy =
            address(new ATKTypedImplementationProxy(address(this), TOPIC_SCHEME_REGISTRY, topicSchemeRegistryData));

        // Deploy the SMARTIdentityRegistryProxy. Its constructor requires the addresses of other newly created proxies
        // (storage and trusted issuers) and an initial admin.
        // Passing these as local variables is safe as they don't rely on this contract's state being prematurely read.
        address[] memory initialRegistrarAdmins = new address[](3);
        initialRegistrarAdmins[0] = initialAdmin;
        initialRegistrarAdmins[1] = localTokenFactoryRegistryProxy;
        initialRegistrarAdmins[2] = localAddonRegistryProxy;

        bytes memory identityRegistryData = abi.encodeWithSelector(
            IATKIdentityRegistry.initialize.selector,
            initialAdmin,
            initialRegistrarAdmins,
            localIdentityRegistryStorageProxy,
            localTrustedIssuersRegistryProxy,
            localTopicSchemeRegistryProxy
        );
        address localIdentityRegistryProxy =
            address(new ATKTypedImplementationProxy(address(this), IDENTITY_REGISTRY, identityRegistryData));

        // Deploy the ATKIdentityFactoryProxy, linking it to this ATKSystem and setting an initial admin.
        bytes memory identityFactoryData =
            abi.encodeWithSelector(IATKIdentityFactory.initialize.selector, address(this));
        address localIdentityFactoryProxy =
            address(new ATKTypedImplementationProxy(address(this), IDENTITY_FACTORY, identityFactoryData));

        // --- Effects (Update state variables for proxy addresses) ---
        // Now that all proxies are created, update the contract's state variables to store their addresses.
        _complianceProxy = localComplianceProxy;
        _identityRegistryStorageProxy = localIdentityRegistryStorageProxy;
        _trustedIssuersRegistryProxy = localTrustedIssuersRegistryProxy;
        _topicSchemeRegistryProxy = localTopicSchemeRegistryProxy;
        _identityRegistryProxy = localIdentityRegistryProxy;
        _identityFactoryProxy = localIdentityFactoryProxy;
        _complianceModuleRegistryProxy = localComplianceModuleRegistryProxy;
        _tokenFactoryRegistryProxy = localTokenFactoryRegistryProxy;
        _addonRegistryProxy = localAddonRegistryProxy;
        _systemAccessManagerProxy = localSystemAccessManagerProxy;

        // --- Interactions (Part 2: Call methods on newly created proxies to link them) ---
        // After all proxy state variables are set, perform any necessary interactions between the new proxies.
        // Here, we bind the IdentityRegistryProxy to its dedicated IdentityRegistryStorageProxy.
        // This tells the storage proxy which identity registry is allowed to manage it.
        IATKIdentityRegistryStorage(localIdentityRegistryStorageProxy).bindIdentityRegistry(
            localIdentityRegistryProxy // Using the local variable, or _identityRegistryProxy which is now correctly
                // set.
        );

        // Grant necessary roles to the system access manager for topic scheme management
        IATKSystemAccessManager(localSystemAccessManagerProxy).grantRole(
            ATKSystemRoles.CLAIM_POLICY_MANAGER_ROLE, initialAdmin
        );
        IATKSystemAccessManager(localSystemAccessManagerProxy).grantRole(
            ATKSystemRoles.CLAIM_POLICY_MANAGER_ROLE, address(this)
        );

        // Register the topic schemes.
        IATKTopicSchemeRegistry(localTopicSchemeRegistryProxy).batchRegisterTopicSchemes(
            ATKTopics.names(), ATKTopics.signatures()
        );

        // Register the identity verification module
        if (_identityVerificationModule != address(0)) {
            _checkInterface(_identityVerificationModule, _COMPLIANCE_MODULE_ID);

            IATKComplianceModuleRegistry(localComplianceModuleRegistryProxy).registerComplianceModule(
                _identityVerificationModule
            );
        }

        // Mark the system as bootstrapped
        _bootstrapped = true;

        // Emit an event to log that bootstrapping is complete and to provide the addresses of the deployed proxies.
        emit Bootstrapped(
            _msgSender(),
            _complianceProxy, // These will now use the updated state values
            _identityRegistryProxy,
            _identityRegistryStorageProxy,
            _trustedIssuersRegistryProxy,
            _topicSchemeRegistryProxy,
            _identityFactoryProxy,
            _tokenFactoryRegistryProxy,
            _addonRegistryProxy,
            _complianceModuleRegistryProxy,
            _identityVerificationModule,
            _systemAccessManagerProxy,
            _implementations[SYSTEM_ACCESS_MANAGER]
        );
    }

    // --- Implementation Setter Functions ---
    // These functions allow an admin to update the logic contract addresses for the various modules and identity types.
    // This is crucial for upgrading the system or fixing bugs in implementation contracts without changing the
    // stable proxy addresses that other parts of the ecosystem interact with.
    // All setters are restricted to `DEFAULT_ADMIN_ROLE` and perform interface checks.

    /// @notice Sets (updates) the address of the compliance module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if the provided `implementation` address is the zero address or does not support the `ISMARTCompliance`
    /// interface.
    /// Emits a `ComplianceImplementationUpdated` event upon successful update.
    /// @param implementation_ The new address for the compliance module logic contract.
    function setComplianceImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert ComplianceImplementationNotSet();
        _checkInterface(implementation_, _COMPLIANCE_ID); // Ensure it supports the correct interface.
        _implementations[COMPLIANCE] = implementation_;
        emit ComplianceImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the identity registry module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if the `implementation` address is zero or does not support `ISMARTIdentityRegistry`.
    /// Emits an `IdentityRegistryImplementationUpdated` event.
    /// @param implementation_ The new address for the identity registry logic contract.
    function setIdentityRegistryImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert IdentityRegistryImplementationNotSet();
        _checkInterface(implementation_, _IDENTITY_REGISTRY_ID);
        _implementations[IDENTITY_REGISTRY] = implementation_;
        emit IdentityRegistryImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the identity registry storage module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `ISMARTIdentityRegistryStorage`.
    /// Emits an `IdentityRegistryStorageImplementationUpdated` event.
    /// @param implementation_ The new address for the identity registry storage logic contract.
    function setIdentityRegistryStorageImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert IdentityRegistryStorageImplementationNotSet();
        _checkInterface(implementation_, _IDENTITY_REGISTRY_STORAGE_ID);
        _implementations[IDENTITY_REGISTRY_STORAGE] = implementation_;
        emit IdentityRegistryStorageImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the trusted issuers registry module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `IERC3643TrustedIssuersRegistry`.
    /// Emits a `TrustedIssuersRegistryImplementationUpdated` event.
    /// @param implementation_ The new address for the trusted issuers registry logic contract.
    function setTrustedIssuersRegistryImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert TrustedIssuersRegistryImplementationNotSet();
        _checkInterface(implementation_, _TRUSTED_ISSUERS_REGISTRY_ID);
        _implementations[TRUSTED_ISSUERS_REGISTRY] = implementation_;
        emit TrustedIssuersRegistryImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the topic scheme registry module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `ISMARTTopicSchemeRegistry`.
    /// Emits a `TopicSchemeRegistryImplementationUpdated` event.
    /// @param implementation_ The new address for the topic scheme registry logic contract.
    function setTopicSchemeRegistryImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert TopicSchemeRegistryImplementationNotSet();
        _checkInterface(implementation_, _TOPIC_SCHEME_REGISTRY_ID);
        _implementations[TOPIC_SCHEME_REGISTRY] = implementation_;
        emit TopicSchemeRegistryImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the identity factory module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `IATKIdentityFactory`.
    /// Emits an `IdentityFactoryImplementationUpdated` event.
    /// @param implementation_ The new address for the identity factory logic contract.
    function setIdentityFactoryImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert IdentityFactoryImplementationNotSet();
        _checkInterface(implementation_, _IDENTITY_FACTORY_ID);
        _implementations[IDENTITY_FACTORY] = implementation_;
        emit IdentityFactoryImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the standard identity contract's implementation (logic template).
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `IIdentity` (from OnchainID standard).
    /// Emits an `IdentityImplementationUpdated` event.
    /// @param implementation_ The new address for the standard identity logic template.
    function setIdentityImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert IdentityImplementationNotSet();
        _checkInterface(implementation_, _IIDENTITY_ID);
        _implementations[IDENTITY] = implementation_;
        emit IdentityImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the contract identity implementation (logic template).
    /// @dev Only callable by an address with the `IMPLEMENTATION_MANAGER_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `IIdentity` (from OnchainID standard).
    /// Emits a `ContractIdentityImplementationUpdated` event.
    /// @param implementation_ The new address for the contract identity logic template.
    function setContractIdentityImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert ContractIdentityImplementationNotSet();
        _checkInterface(implementation_, _IIDENTITY_ID);
        _implementations[CONTRACT_IDENTITY] = implementation_;
        emit ContractIdentityImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the token access manager contract's implementation (logic).
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `ISMARTTokenAccessManager`.
    /// Emits a `TokenAccessManagerImplementationUpdated` event.
    /// @param implementation_ The new address for the token access manager logic contract.
    function setTokenAccessManagerImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert TokenAccessManagerImplementationNotSet();
        _checkInterface(implementation_, _TOKEN_ACCESS_MANAGER_ID);
        _implementations[TOKEN_ACCESS_MANAGER] = implementation_;
        emit TokenAccessManagerImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the compliance module registry's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if the provided `implementation` address is the zero address or does not support the
    /// `IComplianceModuleRegistry` interface.
    /// Emits a `ComplianceModuleRegistryImplementationUpdated` event upon successful update.
    /// @param implementation_ The new address for the compliance module registry logic contract.
    function setComplianceModuleRegistryImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert ComplianceModuleRegistryImplementationNotSet();
        _checkInterface(implementation_, _COMPLIANCE_MODULE_REGISTRY_ID);
        _implementations[COMPLIANCE_MODULE_REGISTRY] = implementation_;
        emit ComplianceModuleRegistryImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the addon registry's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if the provided `implementation` address is the zero address or does not support the
    /// `ISystemAddonRegistry` interface.
    /// Emits a `SystemAddonRegistryImplementationUpdated` event upon successful update.
    /// @param implementation_ The new address for the addon registry logic contract.
    function setAddonRegistryImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert AddonRegistryImplementationNotSet();
        _checkInterface(implementation_, _ADDON_REGISTRY_ID);
        _implementations[ADDON_REGISTRY] = implementation_;
        emit SystemAddonRegistryImplementationUpdated(_msgSender(), implementation_);
    }

    /// @notice Sets (updates) the address of the token factory registry's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if the provided `implementation` address is the zero address or does not support the
    /// `ITokenFactoryRegistry` interface.
    /// Emits a `TokenFactoryRegistryImplementationUpdated` event upon successful update.
    /// @param implementation_ The new address for the token factory registry logic contract.
    function setTokenFactoryRegistryImplementation(address implementation_)
        public
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert TokenFactoryRegistryImplementationNotSet();
        _checkInterface(implementation_, _TOKEN_FACTORY_REGISTRY_ID);
        _implementations[TOKEN_FACTORY_REGISTRY] = implementation_;
        emit TokenFactoryRegistryImplementationUpdated(_msgSender(), implementation_);
    }

    // --- Implementation Getter Functions ---
    // These public view functions allow anyone to query the current implementation (logic contract) addresses
    // for the various modules and identity types. These are the addresses that the respective proxy contracts
    // will delegate calls to.

    /// @notice Gets the implementation address for a given module type.
    /// @param moduleType The type of the module.
    /// @return The address of the implementation logic contract.
    function implementation(bytes32 moduleType) public view returns (address) {
        return _implementations[moduleType];
    }

    /// @notice Returns the address of the identity implementation.
    /// @return The address of the identity implementation contract.
    function identityImplementation() external view returns (address) {
        return _implementations[IDENTITY];
    }

    /// @notice Returns the address of the contract identity implementation.
    /// @return The address of the contract identity implementation contract.
    function contractIdentityImplementation() external view returns (address) {
        return _implementations[CONTRACT_IDENTITY];
    }

    /// @notice Returns the address of the access manager implementation.
    /// @return The address of the access manager implementation contract.
    function tokenAccessManagerImplementation() external view returns (address) {
        return _implementations[TOKEN_ACCESS_MANAGER];
    }

    /// @notice Returns the address of the system access manager implementation.
    /// @return The address of the system access manager implementation contract.
    function systemAccessManagerImplementation() external view returns (address) {
        return _implementations[SYSTEM_ACCESS_MANAGER];
    }

    // --- Proxy Getter Functions ---
    // These public view functions allow anyone to query the stable addresses of the proxy contracts for each module.
    // Interactions with the SMART Protocol modules should always go through these proxy addresses.

    /// @notice Gets the address of the compliance module's proxy contract.
    /// @return The address of the compliance proxy contract.
    function compliance() public view returns (address) {
        return _complianceProxy;
    }

    /// @notice Gets the address of the identity registry module's proxy contract.
    /// @return The address of the identity registry proxy contract.
    function identityRegistry() public view returns (address) {
        return _identityRegistryProxy;
    }

    /// @notice Gets the address of the identity registry storage module's proxy contract.
    /// @return The address of the identity registry storage proxy contract.
    function identityRegistryStorage() public view returns (address) {
        return _identityRegistryStorageProxy;
    }

    /// @notice Gets the address of the trusted issuers registry module's proxy contract.
    /// @return The address of the trusted issuers registry proxy contract.
    function trustedIssuersRegistry() public view returns (address) {
        return _trustedIssuersRegistryProxy;
    }

    /// @notice Gets the address of the topic scheme registry module's proxy contract.
    /// @return The address of the topic scheme registry proxy contract.
    function topicSchemeRegistry() public view returns (address) {
        return _topicSchemeRegistryProxy;
    }

    /// @notice Gets the address of the identity factory module's proxy contract.
    /// @return The address of the identity factory proxy contract.
    function identityFactory() public view returns (address) {
        return _identityFactoryProxy;
    }

    /// @notice Gets the address of the compliance module registry's proxy contract.
    /// @return The address of the compliance module registry proxy contract.
    function complianceModuleRegistry() public view returns (address) {
        return _complianceModuleRegistryProxy;
    }

    /// @notice Gets the address of the addon registry's proxy contract.
    /// @return The address of the addon registry proxy contract.
    function systemAddonRegistry() public view returns (address) {
        return _addonRegistryProxy;
    }

    /// @notice Gets the address of the token factory registry's proxy contract.
    /// @return The address of the token factory registry proxy contract.
    function tokenFactoryRegistry() public view returns (address) {
        return _tokenFactoryRegistryProxy;
    }

    /// @notice Gets the address of the system access manager's proxy contract.
    /// @return The address of the system access manager proxy contract.
    function systemAccessManager() public view returns (address) {
        return _systemAccessManagerProxy;
    }

    // --- Identity Verification Module ---

    /// @notice Gets the address of the identity verification module's proxy contract.
    /// @return The address of the identity verification module proxy contract.
    function identityVerificationModule() public view returns (address) {
        return _identityVerificationModule;
    }

    // --- Governance Functions ---

    // --- Internal Functions (Overrides for ERC2771Context and ERC165/AccessControl) ---

    /// @notice Returns the address of the original transaction sender
    /// @dev Overrides the `_msgSender()` function from OpenZeppelin's `Context` and `ERC2771Context`.
    /// This ensures that in the context of a meta-transaction (via a trusted forwarder), `msg.sender` (and thus
    /// the return value of this function) correctly refers to the original user who signed the transaction,
    /// rather than the forwarder contract that relayed it.
    /// If not a meta-transaction, it behaves like the standard `msg.sender`.
    /// @return The address of the original transaction sender (user) or the direct caller.
    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
        return super._msgSender(); // Calls the ERC2771Context implementation.
    }

    /// @notice Returns the original call data of the transaction
    /// @dev Overrides the `_msgData()` function from OpenZeppelin's `Context` and `ERC2771Context`.
    /// Similar to `_msgSender()`, this ensures that `msg.data` (and the return value of this function)
    /// refers to the original call data from the user in a meta-transaction context.
    /// If not a meta-transaction, it behaves like the standard `msg.data`.
    /// @return The original call data of the transaction.
    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData(); // Calls the ERC2771Context implementation.
    }

    /// @notice Returns the length of the context suffix for meta-transactions
    /// @dev Overrides `_contextSuffixLength` from OpenZeppelin's `ERC2771Context`.
    /// This function is part of the ERC2771 meta-transaction standard. It indicates the length of the suffix
    /// appended to the call data by a forwarder, which typically contains the original sender's address.
    /// The base `ERC2771Context` implementation handles this correctly.
    /// @return The length of the context suffix in the call data for meta-transactions.
    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }

    /// @notice Checks if the contract supports a given interface ID, according to ERC165.
    /// @dev This function is part of the ERC165 standard for interface detection.
    /// It returns `true` if this contract implements the interface specified by `interfaceId`.
    /// It explicitly supports the `IATKSystem` interface and inherits support for other interfaces
    /// like `IERC165` (from `ERC165`) and `IAccessControl` (from `AccessControl`).
    /// @param interfaceId The 4-byte interface identifier to check.
    /// @return supported `true` if the contract supports the interface, `false` otherwise.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC165Upgradeable, AccessControlUpgradeable, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId) || interfaceId == type(IATKSystem).interfaceId
            || interfaceId == type(IATKTypedImplementationRegistry).interfaceId;
    }
}
