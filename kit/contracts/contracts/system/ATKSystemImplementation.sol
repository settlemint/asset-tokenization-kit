// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {
    ERC2771ContextUpgradeable,
    ContextUpgradeable
} from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { IATKSystem } from "./IATKSystem.sol";
import {
    ComplianceImplementationNotSet,
    IdentityRegistryImplementationNotSet,
    IdentityRegistryStorageImplementationNotSet,
    TrustedIssuersRegistryImplementationNotSet,
    IdentityFactoryImplementationNotSet,
    IdentityImplementationNotSet,
    TokenIdentityImplementationNotSet,
    InvalidImplementationInterface,
    InvalidTokenFactoryAddress,
    TokenFactoryTypeAlreadyRegistered,
    InvalidTokenImplementationAddress,
    InvalidTokenImplementationInterface,
    TokenAccessManagerImplementationNotSet,
    SystemAlreadyBootstrapped,
    SystemNotBootstrapped,
    TopicSchemeRegistryImplementationNotSet,
    IdentityVerificationModuleNotSet,
    AddonTypeAlreadyRegistered,
    InvalidAddonAddress
} from "./ATKSystemErrors.sol";
import { ATKSystemAddonProxy } from "./ATKSystemAddonProxy.sol";

// Compliance modules
import { SMARTIdentityVerificationComplianceModule } from
    "../smart/modules/SMARTIdentityVerificationComplianceModule.sol";

import { ISMARTComplianceModule } from "../smart/interface/ISMARTComplianceModule.sol";

error ComplianceModuleAlreadyRegistered(string name);
error InvalidComplianceModuleAddress();

// Constants
import { ATKSystemRoles } from "./ATKSystemRoles.sol";
import { ATKTopics } from "./ATKTopics.sol";

// Interface imports
import { IATKTokenFactory } from "./token-factory/IATKTokenFactory.sol";
import { ISMARTCompliance } from "../smart/interface/ISMARTCompliance.sol";
import { IATKIdentityFactory } from "./identity-factory/IATKIdentityFactory.sol";
import { IERC3643TrustedIssuersRegistry } from "../smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { ISMARTIdentityRegistryStorage } from "../smart/interface/ISMARTIdentityRegistryStorage.sol";
import { ISMARTIdentityRegistry } from "../smart/interface/ISMARTIdentityRegistry.sol";
import { ISMARTTokenAccessManager } from "../smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ISMARTTopicSchemeRegistry } from "../smart/interface/ISMARTTopicSchemeRegistry.sol";
import { ATKComplianceProxy } from "./compliance/ATKComplianceProxy.sol";
import { ATKIdentityRegistryProxy } from "./identity-registry/ATKIdentityRegistryProxy.sol";
import { ATKIdentityRegistryStorageProxy } from "./identity-registry-storage/ATKIdentityRegistryStorageProxy.sol";
import { ATKTrustedIssuersRegistryProxy } from "./trusted-issuers-registry/ATKTrustedIssuersRegistryProxy.sol";
import { ATKTopicSchemeRegistryProxy } from "./topic-scheme-registry/ATKTopicSchemeRegistryProxy.sol";
import { ATKIdentityFactoryProxy } from "./identity-factory/ATKIdentityFactoryProxy.sol";
import { ATKTokenFactoryProxy } from "./token-factory/ATKTokenFactoryProxy.sol";
import { IWithTypeIdentifier } from "./../smart/interface/IWithTypeIdentifier.sol";

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
contract ATKSystemImplementation is
    Initializable,
    IATKSystem,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // Expected interface IDs used for validating implementation contracts.
    // These are unique identifiers for Solidity interfaces, ensuring that a contract claiming to be, for example,
    // an ISMARTCompliance implementation actually supports the functions defined in that interface.
    bytes4 private constant _IATK_SYSTEM_ID = type(IATKSystem).interfaceId;
    bytes4 private constant _ISMART_COMPLIANCE_ID = type(ISMARTCompliance).interfaceId;
    bytes4 private constant _ISMART_IDENTITY_REGISTRY_ID = type(ISMARTIdentityRegistry).interfaceId;
    bytes4 private constant _ISMART_IDENTITY_REGISTRY_STORAGE_ID = type(ISMARTIdentityRegistryStorage).interfaceId;
    bytes4 private constant _IERC3643_TRUSTED_ISSUERS_REGISTRY_ID = type(IERC3643TrustedIssuersRegistry).interfaceId;
    bytes4 private constant _ISMART_TOPIC_SCHEME_REGISTRY_ID = type(ISMARTTopicSchemeRegistry).interfaceId;
    bytes4 private constant _IATK_IDENTITY_FACTORY_ID = type(IATKIdentityFactory).interfaceId;
    bytes4 private constant _IIDENTITY_ID = type(IIdentity).interfaceId;
    bytes4 private constant _IATK_TOKEN_FACTORY_ID = type(IATKTokenFactory).interfaceId;
    bytes4 private constant _ISMART_TOKEN_ACCESS_MANAGER_ID = type(ISMARTTokenAccessManager).interfaceId;
    bytes4 private constant _ISMART_COMPLIANCE_MODULE_ID = type(ISMARTComplianceModule).interfaceId;

    // --- State Variables ---
    // State variables store data persistently on the blockchain.

    // Addresses for the compliance module: one for the logic, one for the proxy.
    /// @dev Stores the address of the current compliance logic contract.
    address private _complianceImplementation;
    /// @dev Stores the address of the compliance module's proxy contract.
    address private _complianceProxy;

    // Addresses for the identity registry module.
    /// @dev Stores the address of the current identity registry logic contract.
    address private _identityRegistryImplementation;
    /// @dev Stores the address of the identity registry module's proxy contract.
    address private _identityRegistryProxy;

    // Addresses for the identity registry storage module.
    /// @dev Stores the address of the current identity registry storage logic contract.
    address private _identityRegistryStorageImplementation;
    /// @dev Stores the address of the identity registry storage module's proxy contract.
    address private _identityRegistryStorageProxy;

    // Addresses for the trusted issuers registry module.
    /// @dev Stores the address of the current trusted issuers registry logic contract.
    address private _trustedIssuersRegistryImplementation;
    /// @dev Stores the address of the trusted issuers registry module's proxy contract.
    address private _trustedIssuersRegistryProxy;

    // Addresses for the topic scheme registry module.
    /// @dev Stores the address of the current topic scheme registry logic contract.
    address private _topicSchemeRegistryImplementation;
    /// @dev Stores the address of the topic scheme registry module's proxy contract.
    address private _topicSchemeRegistryProxy;

    // Addresses for the identity factory module.
    /// @dev Stores the address of the current identity factory logic contract.
    address private _identityFactoryImplementation;
    /// @dev Stores the address of the identity factory module's proxy contract.
    address private _identityFactoryProxy;

    /// @dev Stores the address of the current token access manager logic contract.
    address private _tokenAccessManagerImplementation;

    // Addresses for the identity contract implementations (templates).
    /// @dev Stores the address of the current standard identity logic contract (template).
    address private _identityImplementation;
    /// @dev Stores the address of the current token identity logic contract (template).
    address private _tokenIdentityImplementation;

    /// @dev Stores the address of the current identity verification module instance.
    address private _identityVerificationModule;

    /// @dev Flag to indicate if the system has been bootstrapped.
    bool private _bootstrapped;

    // Token Factories by Type
    mapping(bytes32 typeHash => address tokenFactoryImplementationAddress) private tokenFactoryImplementationsByType;
    mapping(bytes32 typeHash => address tokenFactoryProxyAddress) private tokenFactoryProxiesByType;

    // System Addons by Type
    mapping(bytes32 typeHash => address addonImplementationAddress) private addonImplementationsByType;
    mapping(bytes32 typeHash => address addonProxyAddress) private addonProxiesByType;

    // Compliance Modules by Type
    mapping(bytes32 typeHash => address moduleAddress) private complianceModulesByType;

    // --- Internal Helper for Interface Check ---
    /// @dev Internal helper function to check if a given contract address (`implAddress`)
    /// supports a specific interface (`interfaceId`) using ERC165 introspection.
    /// ERC165 is a standard for publishing and detecting what interfaces a smart contract implements.
    /// @param implAddress The address of the contract to check.
    /// @param interfaceId The 4-byte identifier of the interface to check for support.
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
    /// @param tokenIdentityImplementation_ The initial address of the token identity contract's logic (template). Must
    /// be IERC734/IIdentity compliant.
    /// @param tokenAccessManagerImplementation_ The initial address of the token access manager contract's logic. Must
    /// be ISMARTTokenAccessManager compliant.
    /// @param identityVerificationModule_ The initial address of the identity verification module
    /// contract's logic.
    function initialize(
        address initialAdmin_,
        address complianceImplementation_,
        address identityRegistryImplementation_,
        address identityRegistryStorageImplementation_,
        address trustedIssuersRegistryImplementation_,
        address topicSchemeRegistryImplementation_,
        address identityFactoryImplementation_,
        address identityImplementation_, // Expected to be IERC734/IIdentity compliant
        address tokenIdentityImplementation_, // Expected to be IERC734/IIdentity compliant
        address tokenAccessManagerImplementation_, // Expected to be ISMARTTokenAccessManager compliant
        address identityVerificationModule_
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

        // Validate and set the compliance implementation address.
        if (complianceImplementation_ == address(0)) revert ComplianceImplementationNotSet();
        _checkInterface(complianceImplementation_, _ISMART_COMPLIANCE_ID); // Ensure it supports ISMARTCompliance
        _complianceImplementation = complianceImplementation_;
        emit ComplianceImplementationUpdated(initialAdmin_, _complianceImplementation);

        // Validate and set the identity registry implementation address.
        if (identityRegistryImplementation_ == address(0)) revert IdentityRegistryImplementationNotSet();
        _checkInterface(identityRegistryImplementation_, _ISMART_IDENTITY_REGISTRY_ID); // Ensure it supports
            // ISMARTIdentityRegistry
        _identityRegistryImplementation = identityRegistryImplementation_;
        emit IdentityRegistryImplementationUpdated(initialAdmin_, _identityRegistryImplementation);

        // Validate and set the identity registry storage implementation address.
        if (identityRegistryStorageImplementation_ == address(0)) revert IdentityRegistryStorageImplementationNotSet();
        _checkInterface(identityRegistryStorageImplementation_, _ISMART_IDENTITY_REGISTRY_STORAGE_ID); // Ensure it
            // supports ISMARTIdentityRegistryStorage
        _identityRegistryStorageImplementation = identityRegistryStorageImplementation_;
        emit IdentityRegistryStorageImplementationUpdated(initialAdmin_, _identityRegistryStorageImplementation);

        // Validate and set the trusted issuers registry implementation address.
        if (trustedIssuersRegistryImplementation_ == address(0)) revert TrustedIssuersRegistryImplementationNotSet();
        _checkInterface(trustedIssuersRegistryImplementation_, _IERC3643_TRUSTED_ISSUERS_REGISTRY_ID); // Ensure it
            // supports IERC3643TrustedIssuersRegistry
        _trustedIssuersRegistryImplementation = trustedIssuersRegistryImplementation_;
        emit TrustedIssuersRegistryImplementationUpdated(initialAdmin_, _trustedIssuersRegistryImplementation);

        // Validate and set the topic scheme registry implementation address.
        if (topicSchemeRegistryImplementation_ == address(0)) revert TopicSchemeRegistryImplementationNotSet();
        _checkInterface(topicSchemeRegistryImplementation_, _ISMART_TOPIC_SCHEME_REGISTRY_ID); // Ensure it supports
            // ISMARTTopicSchemeRegistry
        _topicSchemeRegistryImplementation = topicSchemeRegistryImplementation_;
        emit TopicSchemeRegistryImplementationUpdated(initialAdmin_, _topicSchemeRegistryImplementation);

        // Validate and set the identity factory implementation address.
        if (identityFactoryImplementation_ == address(0)) revert IdentityFactoryImplementationNotSet();
        _checkInterface(identityFactoryImplementation_, _IATK_IDENTITY_FACTORY_ID); // Ensure it supports
            // IATKIdentityFactory
        _identityFactoryImplementation = identityFactoryImplementation_;
        emit IdentityFactoryImplementationUpdated(initialAdmin_, _identityFactoryImplementation);

        // Validate and set the token access manager implementation address.
        if (tokenAccessManagerImplementation_ == address(0)) revert TokenAccessManagerImplementationNotSet();
        _checkInterface(tokenAccessManagerImplementation_, _ISMART_TOKEN_ACCESS_MANAGER_ID); // Ensure it supports
            // ISMARTTokenAccessManager
        _tokenAccessManagerImplementation = tokenAccessManagerImplementation_;
        emit TokenAccessManagerImplementationUpdated(initialAdmin_, _tokenAccessManagerImplementation);

        // Validate and set the standard identity implementation address.
        if (identityImplementation_ == address(0)) revert IdentityImplementationNotSet();
        _checkInterface(identityImplementation_, _IIDENTITY_ID); // Ensure it supports OnchainID's
            // IIdentity
        _identityImplementation = identityImplementation_;
        emit IdentityImplementationUpdated(initialAdmin_, _identityImplementation);

        // Validate and set the token identity implementation address.
        if (tokenIdentityImplementation_ == address(0)) revert TokenIdentityImplementationNotSet();
        _checkInterface(tokenIdentityImplementation_, _IIDENTITY_ID); // Ensure it supports OnchainID's
            // IIdentity
        _tokenIdentityImplementation = tokenIdentityImplementation_;
        emit TokenIdentityImplementationUpdated(initialAdmin_, _tokenIdentityImplementation);

        // Validate and set the identity verification module implementation address.
        if (identityVerificationModule_ == address(0)) {
            revert IdentityVerificationModuleNotSet();
        }
        _identityVerificationModule = identityVerificationModule_;
    }

    /// @dev Authorizes an upgrade to a new implementation contract.
    /// The UUPS upgrade mechanism is used.
    /// Only the `DEFAULT_ADMIN_ROLE` can authorize an upgrade.
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
    function bootstrap() external nonReentrant onlyRole(DEFAULT_ADMIN_ROLE) {
        // Check if system is already bootstrapped.
        if (_bootstrapped) {
            revert SystemAlreadyBootstrapped();
        }

        // Ensure all necessary implementation addresses are set before proceeding with proxy deployment.
        if (_complianceImplementation == address(0)) revert ComplianceImplementationNotSet();
        if (_identityRegistryImplementation == address(0)) revert IdentityRegistryImplementationNotSet();
        if (_identityRegistryStorageImplementation == address(0)) revert IdentityRegistryStorageImplementationNotSet();
        if (_trustedIssuersRegistryImplementation == address(0)) revert TrustedIssuersRegistryImplementationNotSet();
        if (_topicSchemeRegistryImplementation == address(0)) revert TopicSchemeRegistryImplementationNotSet();
        if (_identityFactoryImplementation == address(0)) revert IdentityFactoryImplementationNotSet();

        // The caller of this bootstrap function (who must be an admin) will also be set as the initial admin
        // for some of the newly deployed proxy contracts where applicable.
        address initialAdmin = _msgSender(); // _msgSender() correctly resolves the original caller in ERC2771 context.

        // --- Interactions (Part 1: Create proxy instances and store their addresses in local variables) ---
        // This follows the Checks-Effects-Interactions pattern where possible.
        // First, we create all new contract instances (interactions) and store their addresses in local variables.
        // This avoids reading from state that is being modified in the same transaction before it's fully updated.

        // Deploy the ATKComplianceProxy, linking it to this ATKSystem contract.
        address[] memory initialComplianceAdmins = new address[](2);
        initialComplianceAdmins[0] = initialAdmin;
        // This is needed to give the token factories the allow list manager role
        initialComplianceAdmins[1] = address(this);
        address localComplianceProxy = address(new ATKComplianceProxy(address(this), initialComplianceAdmins));

        // Deploy the ATKIdentityRegistryStorageProxy, linking it to this ATKSystem and setting an initial admin.
        address localIdentityRegistryStorageProxy =
            address(new ATKIdentityRegistryStorageProxy(address(this), initialAdmin));

        // Deploy the ATKTrustedIssuersRegistryProxy, linking it to this ATKSystem and setting an initial admin.
        address localTrustedIssuersRegistryProxy =
            address(new ATKTrustedIssuersRegistryProxy(address(this), initialAdmin));

        // Deploy the ATKTopicSchemeRegistryProxy, linking it to this ATKSystem and setting an initial admin.
        address localTopicSchemeRegistryProxy = address(new ATKTopicSchemeRegistryProxy(address(this), initialAdmin));

        // Deploy the SMARTIdentityRegistryProxy. Its constructor requires the addresses of other newly created proxies
        // (storage and trusted issuers) and an initial admin.
        // Passing these as local variables is safe as they don't rely on this contract's state being prematurely read.
        address localIdentityRegistryProxy = address(
            new ATKIdentityRegistryProxy(
                address(this),
                initialAdmin,
                localIdentityRegistryStorageProxy,
                localTrustedIssuersRegistryProxy,
                localTopicSchemeRegistryProxy
            )
        );

        // Deploy the ATKIdentityFactoryProxy, linking it to this ATKSystem and setting an initial admin.
        address localIdentityFactoryProxy = address(new ATKIdentityFactoryProxy(address(this), initialAdmin));

        // --- Effects (Update state variables for proxy addresses) ---
        // Now that all proxies are created, update the contract's state variables to store their addresses.
        _complianceProxy = localComplianceProxy;
        _identityRegistryStorageProxy = localIdentityRegistryStorageProxy;
        _trustedIssuersRegistryProxy = localTrustedIssuersRegistryProxy;
        _topicSchemeRegistryProxy = localTopicSchemeRegistryProxy;
        _identityRegistryProxy = localIdentityRegistryProxy;
        _identityFactoryProxy = localIdentityFactoryProxy;

        // --- Interactions (Part 2: Call methods on newly created proxies to link them) ---
        // After all proxy state variables are set, perform any necessary interactions between the new proxies.
        // Here, we bind the IdentityRegistryProxy to its dedicated IdentityRegistryStorageProxy.
        // This tells the storage proxy which identity registry is allowed to manage it.
        ISMARTIdentityRegistryStorage(localIdentityRegistryStorageProxy).bindIdentityRegistry(
            localIdentityRegistryProxy // Using the local variable, or _identityRegistryProxy which is now correctly
                // set.
        );

        // Register the topic schemes.
        ISMARTTopicSchemeRegistry(localTopicSchemeRegistryProxy).batchRegisterTopicSchemes(
            ATKTopics.names(), ATKTopics.signatures()
        );

        // Register the identity verification module
        if (_identityVerificationModule != address(0)) {
            _checkInterface(_identityVerificationModule, _ISMART_COMPLIANCE_MODULE_ID);
            string memory name = ISMARTComplianceModule(_identityVerificationModule).name();
            bytes32 moduleTypeHash = ISMARTComplianceModule(_identityVerificationModule).typeId();

            if (complianceModulesByType[moduleTypeHash] == address(0)) {
                complianceModulesByType[moduleTypeHash] = _identityVerificationModule;
                emit ComplianceModuleRegistered(
                    initialAdmin, name, moduleTypeHash, _identityVerificationModule, block.timestamp
                );
            }
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
            _identityVerificationModule
        );
    }

    /// @inheritdoc IATKSystem
    function createTokenFactory(
        string calldata _name,
        address _factoryImplementation,
        address _tokenImplementation
    )
        external
        override
        nonReentrant
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (address)
    {
        // System must be bootstrapped before creating token factories, as factories need to interact with core proxies.
        if (!_bootstrapped) {
            revert SystemNotBootstrapped();
        }

        if (address(_factoryImplementation) == address(0)) revert InvalidTokenFactoryAddress();
        _checkInterface(_factoryImplementation, _IATK_TOKEN_FACTORY_ID);

        if (address(_tokenImplementation) == address(0)) revert InvalidTokenImplementationAddress();
        // aderyn-fp-next-line(reentrancy-state-change)
        if (!IATKTokenFactory(_factoryImplementation).isValidTokenImplementation(_tokenImplementation)) {
            revert InvalidTokenImplementationInterface();
        }

        bytes32 factoryTypeHash = keccak256(abi.encodePacked(_name));

        if (tokenFactoryImplementationsByType[factoryTypeHash] != address(0)) {
            revert TokenFactoryTypeAlreadyRegistered(_name);
        }

        tokenFactoryImplementationsByType[factoryTypeHash] = _factoryImplementation;

        address _tokenFactoryProxy = address(
            new ATKTokenFactoryProxy(
                address(this), _msgSender(), factoryTypeHash, _tokenImplementation, _identityVerificationModule
            )
        );

        tokenFactoryProxiesByType[factoryTypeHash] = _tokenFactoryProxy;

        // Make it possible that the token factory can issue token identities.
        IAccessControl(address(identityFactoryProxy())).grantRole(
            ATKSystemRoles.TOKEN_IDENTITY_ISSUER_ROLE, _tokenFactoryProxy
        );

        // Make it possible that the token factory can add addresses to the compliance allow list
        IAccessControl(address(complianceProxy())).grantRole(
            ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, _tokenFactoryProxy
        );

        emit TokenFactoryCreated(
            _msgSender(),
            _name,
            IWithTypeIdentifier(_factoryImplementation).typeId(),
            _tokenFactoryProxy,
            _factoryImplementation,
            block.timestamp
        );

        return _tokenFactoryProxy;
    }

    /// @inheritdoc IATKSystem
    function createSystemAddon(
        string calldata name,
        address implementation,
        bytes calldata initializationData
    )
        external
        override
        nonReentrant
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (address proxyAddress)
    {
        // System must be bootstrapped before creating token factories, as factories need to interact with core proxies.
        if (!_bootstrapped) {
            revert SystemNotBootstrapped();
        }

        if (address(implementation) == address(0)) revert InvalidAddonAddress();

        bytes32 addonTypeHash = keccak256(abi.encodePacked(name));

        if (addonImplementationsByType[addonTypeHash] != address(0)) {
            revert AddonTypeAlreadyRegistered(name);
        }

        addonImplementationsByType[addonTypeHash] = implementation;

        address _addonProxy = address(new ATKSystemAddonProxy(address(this), addonTypeHash, initializationData));

        addonProxiesByType[addonTypeHash] = _addonProxy;

        // Make it possible that the addon can add addresses to the compliance allow list
        IAccessControl(address(complianceProxy())).grantRole(ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, _addonProxy);

        // Get the typeId of the addon, if it implements IWithTypeIdentifier
        (bool success, bytes memory data) =
            _addonProxy.staticcall(abi.encodeWithSelector(bytes4(keccak256("typeId()"))));

        bytes32 typeId = bytes32(0);
        if (success && data.length == 32) {
            typeId = abi.decode(data, (bytes32));
        }

        emit SystemAddonCreated(
            _msgSender(), name, typeId, _addonProxy, implementation, initializationData, block.timestamp
        );

        return _addonProxy;
    }

    /// @inheritdoc IATKSystem
    function registerComplianceModule(address _moduleAddress)
        external
        override
        nonReentrant
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        // System must be bootstrapped before registering compliance modules
        if (!_bootstrapped) {
            revert SystemNotBootstrapped();
        }

        if (_moduleAddress == address(0)) revert InvalidComplianceModuleAddress();
        _checkInterface(_moduleAddress, _ISMART_COMPLIANCE_MODULE_ID);

        string memory name = ISMARTComplianceModule(_moduleAddress).name();
        bytes32 moduleTypeHash = ISMARTComplianceModule(_moduleAddress).typeId();

        if (complianceModulesByType[moduleTypeHash] != address(0)) {
            revert ComplianceModuleAlreadyRegistered(name);
        }

        complianceModulesByType[moduleTypeHash] = _moduleAddress;

        emit ComplianceModuleRegistered(_msgSender(), name, moduleTypeHash, _moduleAddress, block.timestamp);
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
    /// @param implementation The new address for the compliance module logic contract.
    function setComplianceImplementation(address implementation) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (implementation == address(0)) revert ComplianceImplementationNotSet();
        _checkInterface(implementation, _ISMART_COMPLIANCE_ID); // Ensure it supports the correct interface.
        _complianceImplementation = implementation;
        emit ComplianceImplementationUpdated(_msgSender(), implementation);
    }

    /// @notice Sets (updates) the address of the identity registry module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if the `implementation` address is zero or does not support `ISMARTIdentityRegistry`.
    /// Emits an `IdentityRegistryImplementationUpdated` event.
    /// @param implementation The new address for the identity registry logic contract.
    function setIdentityRegistryImplementation(address implementation) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (implementation == address(0)) revert IdentityRegistryImplementationNotSet();
        _checkInterface(implementation, _ISMART_IDENTITY_REGISTRY_ID);
        _identityRegistryImplementation = implementation;
        emit IdentityRegistryImplementationUpdated(_msgSender(), implementation);
    }

    /// @notice Sets (updates) the address of the identity registry storage module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `ISMARTIdentityRegistryStorage`.
    /// Emits an `IdentityRegistryStorageImplementationUpdated` event.
    /// @param implementation The new address for the identity registry storage logic contract.
    function setIdentityRegistryStorageImplementation(address implementation) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (implementation == address(0)) revert IdentityRegistryStorageImplementationNotSet();
        _checkInterface(implementation, _ISMART_IDENTITY_REGISTRY_STORAGE_ID);
        _identityRegistryStorageImplementation = implementation;
        emit IdentityRegistryStorageImplementationUpdated(_msgSender(), implementation);
    }

    /// @notice Sets (updates) the address of the trusted issuers registry module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `IERC3643TrustedIssuersRegistry`.
    /// Emits a `TrustedIssuersRegistryImplementationUpdated` event.
    /// @param implementation The new address for the trusted issuers registry logic contract.
    function setTrustedIssuersRegistryImplementation(address implementation) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (implementation == address(0)) revert TrustedIssuersRegistryImplementationNotSet();
        _checkInterface(implementation, _IERC3643_TRUSTED_ISSUERS_REGISTRY_ID);
        _trustedIssuersRegistryImplementation = implementation;
        emit TrustedIssuersRegistryImplementationUpdated(_msgSender(), implementation);
    }

    /// @notice Sets (updates) the address of the topic scheme registry module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `ISMARTTopicSchemeRegistry`.
    /// Emits a `TopicSchemeRegistryImplementationUpdated` event.
    /// @param implementation The new address for the topic scheme registry logic contract.
    function setTopicSchemeRegistryImplementation(address implementation) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (implementation == address(0)) revert TopicSchemeRegistryImplementationNotSet();
        _checkInterface(implementation, _ISMART_TOPIC_SCHEME_REGISTRY_ID);
        _topicSchemeRegistryImplementation = implementation;
        emit TopicSchemeRegistryImplementationUpdated(_msgSender(), implementation);
    }

    /// @notice Sets (updates) the address of the identity factory module's implementation (logic) contract.
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `IATKIdentityFactory`.
    /// Emits an `IdentityFactoryImplementationUpdated` event.
    /// @param implementation The new address for the identity factory logic contract.
    function setIdentityFactoryImplementation(address implementation) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (implementation == address(0)) revert IdentityFactoryImplementationNotSet();
        _checkInterface(implementation, _IATK_IDENTITY_FACTORY_ID);
        _identityFactoryImplementation = implementation;
        emit IdentityFactoryImplementationUpdated(_msgSender(), implementation);
    }

    /// @notice Sets (updates) the address of the standard identity contract's implementation (logic template).
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `IIdentity` (from OnchainID standard).
    /// Emits an `IdentityImplementationUpdated` event.
    /// @param implementation The new address for the standard identity logic template.
    function setIdentityImplementation(address implementation) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (implementation == address(0)) revert IdentityImplementationNotSet();
        _checkInterface(implementation, _IIDENTITY_ID);
        _identityImplementation = implementation;
        emit IdentityImplementationUpdated(_msgSender(), implementation);
    }

    /// @notice Sets (updates) the address of the token identity contract's implementation (logic template).
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `IIdentity` (from OnchainID standard).
    /// Emits a `TokenIdentityImplementationUpdated` event.
    /// @param implementation The new address for the token identity logic template.
    function setTokenIdentityImplementation(address implementation) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (implementation == address(0)) revert TokenIdentityImplementationNotSet();
        _checkInterface(implementation, _IIDENTITY_ID);
        _tokenIdentityImplementation = implementation;
        emit TokenIdentityImplementationUpdated(_msgSender(), implementation);
    }

    /// @notice Sets (updates) the address of the token access manager contract's implementation (logic).
    /// @dev Only callable by an address with the `DEFAULT_ADMIN_ROLE`.
    /// Reverts if `implementation` is zero or doesn't support `ISMARTTokenAccessManager`.
    /// Emits a `TokenAccessManagerImplementationUpdated` event.
    /// @param implementation The new address for the token access manager logic contract.
    function setTokenAccessManagerImplementation(address implementation) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (implementation == address(0)) revert TokenAccessManagerImplementationNotSet();
        _checkInterface(implementation, _ISMART_TOKEN_ACCESS_MANAGER_ID);
        _tokenAccessManagerImplementation = implementation;
        emit TokenAccessManagerImplementationUpdated(_msgSender(), implementation);
    }

    // --- Implementation Getter Functions ---
    // These public view functions allow anyone to query the current implementation (logic contract) addresses
    // for the various modules and identity types. These are the addresses that the respective proxy contracts
    // will delegate calls to.

    /// @notice Gets the current address of the compliance module's implementation (logic) contract.
    /// @return The address of the compliance logic contract.
    function complianceImplementation() public view override returns (address) {
        return _complianceImplementation;
    }

    /// @notice Gets the current address of the identity registry module's implementation (logic) contract.
    /// @return The address of the identity registry logic contract.
    function identityRegistryImplementation() public view override returns (address) {
        return _identityRegistryImplementation;
    }

    /// @notice Gets the current address of the identity registry storage module's implementation (logic) contract.
    /// @return The address of the identity registry storage logic contract.
    function identityRegistryStorageImplementation() public view override returns (address) {
        return _identityRegistryStorageImplementation;
    }

    /// @notice Gets the current address of the trusted issuers registry module's implementation (logic) contract.
    /// @return The address of the trusted issuers registry logic contract.
    function trustedIssuersRegistryImplementation() public view override returns (address) {
        return _trustedIssuersRegistryImplementation;
    }

    /// @notice Gets the current address of the topic scheme registry module's implementation (logic) contract.
    /// @return The address of the topic scheme registry logic contract.
    function topicSchemeRegistryImplementation() public view override returns (address) {
        return _topicSchemeRegistryImplementation;
    }

    /// @notice Gets the current address of the identity factory module's implementation (logic) contract.
    /// @return The address of the identity factory logic contract.
    function identityFactoryImplementation() public view override returns (address) {
        return _identityFactoryImplementation;
    }

    /// @notice Gets the current address of the standard identity contract's implementation (logic template).
    /// @return The address of the standard identity logic template.
    function identityImplementation() public view override returns (address) {
        return _identityImplementation;
    }

    /// @notice Gets the current address of the token identity contract's implementation (logic template).
    /// @return The address of the token identity logic template.
    function tokenIdentityImplementation() public view override returns (address) {
        return _tokenIdentityImplementation;
    }

    /// @notice Gets the current address of the token access manager contract's implementation (logic).
    /// @return The address of the token access manager logic contract.
    function tokenAccessManagerImplementation() public view override returns (address) {
        return _tokenAccessManagerImplementation;
    }

    /// @inheritdoc IATKSystem
    function tokenFactoryImplementation(bytes32 factoryTypeHash) public view override returns (address) {
        return tokenFactoryImplementationsByType[factoryTypeHash];
    }

    /// @inheritdoc IATKSystem
    function addonImplementation(bytes32 addonTypeHash) public view override returns (address) {
        return addonImplementationsByType[addonTypeHash];
    }

    /// @inheritdoc IATKSystem
    function complianceModule(bytes32 moduleTypeHash) public view override returns (address) {
        return complianceModulesByType[moduleTypeHash];
    }

    // --- Proxy Getter Functions ---
    // These public view functions allow anyone to query the stable addresses of the proxy contracts for each module.
    // Interactions with the SMART Protocol modules should always go through these proxy addresses.

    /// @notice Gets the address of the compliance module's proxy contract.
    /// @return The address of the compliance proxy contract.
    function complianceProxy() public view override returns (address) {
        return _complianceProxy;
    }

    /// @notice Gets the address of the identity registry module's proxy contract.
    /// @return The address of the identity registry proxy contract.
    function identityRegistryProxy() public view override returns (address) {
        return _identityRegistryProxy;
    }

    /// @notice Gets the address of the identity registry storage module's proxy contract.
    /// @return The address of the identity registry storage proxy contract.
    function identityRegistryStorageProxy() public view override returns (address) {
        return _identityRegistryStorageProxy;
    }

    /// @notice Gets the address of the trusted issuers registry module's proxy contract.
    /// @return The address of the trusted issuers registry proxy contract.
    function trustedIssuersRegistryProxy() public view override returns (address) {
        return _trustedIssuersRegistryProxy;
    }

    /// @notice Gets the address of the topic scheme registry module's proxy contract.
    /// @return The address of the topic scheme registry proxy contract.
    function topicSchemeRegistryProxy() public view override returns (address) {
        return _topicSchemeRegistryProxy;
    }

    /// @notice Gets the address of the identity factory module's proxy contract.
    /// @return The address of the identity factory proxy contract.
    function identityFactoryProxy() public view override returns (address) {
        return _identityFactoryProxy;
    }

    /// @notice Gets the address of the token factory proxy contract for a given factory type hash.
    /// @param factoryTypeHash The hash of the factory type.
    /// @return The address of the token factory proxy contract.
    function tokenFactoryProxy(bytes32 factoryTypeHash) public view override returns (address) {
        return tokenFactoryProxiesByType[factoryTypeHash];
    }

    /// @notice Gets the address of the system addon proxy contract for a given addon type hash.
    /// @param addonTypeHash The hash of the addon type.
    /// @return The address of the system addon proxy contract.
    function addonProxy(bytes32 addonTypeHash) public view override returns (address) {
        return addonProxiesByType[addonTypeHash];
    }

    // --- Identity Verification Module ---

    /// @notice Gets the address of the identity verification module's proxy contract.
    /// @return The address of the identity verification module proxy contract.
    function identityVerificationModule() public view override returns (address) {
        return _identityVerificationModule;
    }

    // --- Internal Functions (Overrides for ERC2771Context and ERC165/AccessControl) ---

    /// @dev Overrides the `_msgSender()` function from OpenZeppelin's `Context` and `ERC2771Context`.
    /// This ensures that in the context of a meta-transaction (via a trusted forwarder), `msg.sender` (and thus
    /// the return value of this function) correctly refers to the original user who signed the transaction,
    /// rather than the forwarder contract that relayed it.
    /// If not a meta-transaction, it behaves like the standard `msg.sender`.
    /// @return The address of the original transaction sender (user) or the direct caller.
    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
        return super._msgSender(); // Calls the ERC2771Context implementation.
    }

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
    /// @return `true` if the contract supports the interface, `false` otherwise.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC165Upgradeable, AccessControlUpgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == _IATK_SYSTEM_ID || super.supportsInterface(interfaceId);
    }
}
