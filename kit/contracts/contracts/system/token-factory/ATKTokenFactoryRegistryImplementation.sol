// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IWithTypeIdentifier } from "../../smart/interface/IWithTypeIdentifier.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { IATKTokenFactoryRegistry } from "./IATKTokenFactoryRegistry.sol";
import {
    InvalidTokenFactoryAddress,
    TokenFactoryTypeAlreadyRegistered,
    InvalidTokenImplementationAddress,
    InvalidTokenImplementationInterface
} from "../ATKSystemErrors.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";
import { IATKTokenFactory } from "../token-factory/IATKTokenFactory.sol";
import { InvalidImplementationInterface } from "../ATKSystemErrors.sol";
import { IATKTypedImplementationRegistry } from "../IATKTypedImplementationRegistry.sol";
import { ATKTypedImplementationProxy } from "../ATKTypedImplementationProxy.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ISMART } from "../../smart/interface/ISMART.sol";
import { IATKSystemAccessManager } from "../access-manager/IATKSystemAccessManager.sol";

/// @dev Custom errors for ATKTokenFactoryRegistry
error SystemAccessManagerNotSet();
error UnauthorizedAccess();

/**
 * @title ATKTokenFactoryRegistryImplementation
 * @author SettleMint
 * @notice Implementation contract for the ATK Token Factory Registry
 * @dev This contract manages the registration and deployment of token factories within the ATK ecosystem.
 *      Each factory type (Bond, Equity, Fund, etc.) is identified by a unique type hash and deployed
 *      as an upgradeable proxy. The registry ensures that only valid factory implementations supporting
 *      the IATKTokenFactory interface can be registered.
 */
contract ATKTokenFactoryRegistryImplementation is
    Initializable,
    IATKTokenFactoryRegistry,
    IATKTypedImplementationRegistry,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable
{
    IATKSystem private _system;
    /// @notice Optional centralized access manager for enhanced role checking
    /// @dev If set, enables multi-role access patterns alongside existing AccessControl
    IATKSystemAccessManager private _systemAccessManager;

    mapping(bytes32 typeHash => address tokenFactoryImplementationAddress) private tokenFactoryImplementationsByType;
    mapping(bytes32 typeHash => address tokenFactoryProxyAddress) private tokenFactoryProxiesByType;
    bytes4 private constant _IATK_TOKEN_FACTORY_ID = type(IATKTokenFactory).interfaceId;

    // --- Access Control Modifiers ---

    /// @notice Modifier that checks if the caller has any of the specified roles in the system access manager
    /// @dev This implements the new centralized access pattern: onlySystemRoles(MANAGER_ROLE, [SYSTEM_ROLES])
    /// Falls back to AccessControl if system access manager is not set
    /// @param roles Array of roles, where the caller must have at least one
    modifier onlySystemRoles(bytes32[] memory roles) {
        if (address(_systemAccessManager) != address(0)) {
            // Use centralized access manager when available
            if (!_systemAccessManager.hasAnyRole(roles, _msgSender())) revert UnauthorizedAccess();
        } else {
            // Fall back to traditional AccessControl during bootstrap
            if (!hasRole(ATKSystemRoles.REGISTRAR_ROLE, _msgSender())) revert UnauthorizedAccess();
        }
        _;
    }

    // --- Internal Helper Functions ---

    /// @notice Returns the roles that can perform token factory registry operations
    /// @dev Implements the pattern: REGISTRAR_ROLE + [SYSTEM_ROLES]
    /// @return roles Array of roles that can register and manage token factories
    function _getTokenFactoryRegistryRoles() internal pure returns (bytes32[] memory roles) {
        roles = new bytes32[](3);
        roles[0] = ATKSystemRoles.REGISTRAR_ROLE;               // Primary registrar role
        roles[1] = ATKSystemRoles.SYSTEM_MANAGER_ROLE;          // System manager
        roles[2] = ATKSystemRoles.SYSTEM_MODULE_ROLE;           // System module role
    }

    /// @notice Returns the roles that can perform implementation management operations
    /// @dev Implements the pattern: IMPLEMENTATION_MANAGER_ROLE + [SYSTEM_ROLES]
    /// @return roles Array of roles that can manage implementations
    function _getImplementationManagerRoles() internal pure returns (bytes32[] memory roles) {
        roles = new bytes32[](3);
        roles[0] = ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE;  // Primary implementation manager
        roles[1] = ATKSystemRoles.SYSTEM_MANAGER_ROLE;          // System manager
        roles[2] = ATKSystemRoles.SYSTEM_MODULE_ROLE;           // System module role
    }

    /// @notice Constructor that disables initializers and sets the trusted forwarder
    /// @param trustedForwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

        /// @notice Initializes the token factory registry with initial admin and system address
    /// @param initialAdmin The address to be granted admin roles
    /// @param systemAddress The address of the ATK system contract
    function initialize(address initialAdmin, address systemAddress) public override initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE, initialAdmin);
        _grantRole(ATKSystemRoles.REGISTRAR_ROLE, initialAdmin);

        // Grant admin role to the system contract so it can call setSystemAccessManager during bootstrap
        if (systemAddress != address(0)) {
            _grantRole(DEFAULT_ADMIN_ROLE, systemAddress);
        }

        _system = IATKSystem(systemAddress);

        // Note: System access manager will be set later via setSystemAccessManager after system bootstrap
    }

    /// @notice Sets the system access manager for centralized role checking
    /// @param systemAccessManager The address of the system access manager
    /// @dev Only callable by addresses with DEFAULT_ADMIN_ROLE
    function setSystemAccessManager(address systemAccessManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _systemAccessManager = IATKSystemAccessManager(systemAccessManager);
    }

    /// @notice Registers a new token factory type in the registry
    /// @param _name The name of the token factory type (e.g., "Bond", "Equity")
    /// @param _factoryImplementation The implementation contract address for this factory type
    /// @param _tokenImplementation The implementation contract address for tokens created by this factory
    /// @return The address of the deployed factory proxy
    /// @dev Creates an upgradeable proxy for the factory and grants necessary permissions
    function registerTokenFactory(
        string calldata _name,
        address _factoryImplementation,
        address _tokenImplementation
    )
        external
        override
        nonReentrant
        onlySystemRoles(_getTokenFactoryRegistryRoles())
        returns (address)
    {
        if (address(_factoryImplementation) == address(0)) revert InvalidTokenFactoryAddress();
        _checkInterface(_factoryImplementation, _IATK_TOKEN_FACTORY_ID);

        if (address(_tokenImplementation) == address(0)) revert InvalidTokenImplementationAddress();
        if (!IATKTokenFactory(_factoryImplementation).isValidTokenImplementation(_tokenImplementation)) {
            revert InvalidTokenImplementationInterface();
        }

        bytes32 factoryTypeHash = keccak256(abi.encodePacked(_name));

        if (tokenFactoryImplementationsByType[factoryTypeHash] != address(0)) {
            revert TokenFactoryTypeAlreadyRegistered(_name);
        }

        tokenFactoryImplementationsByType[factoryTypeHash] = _factoryImplementation;

        bytes memory tokenFactoryData =
            abi.encodeWithSelector(IATKTokenFactory.initialize.selector, _system, _tokenImplementation, _msgSender());
        address _tokenFactoryProxy =
            address(new ATKTypedImplementationProxy(address(this), factoryTypeHash, tokenFactoryData));

        tokenFactoryProxiesByType[factoryTypeHash] = _tokenFactoryProxy;

        // Grant compliance management role through the system access manager instead of directly on compliance
        IAccessControl(address(_system.systemAccessManager())).grantRole(
            ATKSystemRoles.COMPLIANCE_MANAGER_ROLE, _tokenFactoryProxy
        );

        // Grant permission to register contract identities in the identity registry
        IAccessControl(address(_system.identityRegistry())).grantRole(ATKSystemRoles.REGISTRAR_ROLE, _tokenFactoryProxy);

        emit TokenFactoryRegistered(
            _msgSender(),
            _name,
            IWithTypeIdentifier(_factoryImplementation).typeId(),
            _tokenFactoryProxy,
            _factoryImplementation,
            _tokenImplementation,
            _getRegisteredInterfacesSafely(_tokenImplementation),
            block.timestamp
        );

        return _tokenFactoryProxy;
    }

    /// @notice Updates the implementation address for an existing token factory type
    /// @param factoryTypeHash The type hash of the factory to update
    /// @param implementation_ The new implementation contract address
    /// @dev Only callable by addresses with IMPLEMENTATION_MANAGER_ROLE
    function setTokenFactoryImplementation(
        bytes32 factoryTypeHash,
        address implementation_
    )
        public
        override
        onlySystemRoles(_getImplementationManagerRoles())
    {
        if (implementation_ == address(0)) revert InvalidTokenFactoryAddress();
        if (tokenFactoryImplementationsByType[factoryTypeHash] == address(0)) revert InvalidTokenFactoryAddress();
        _checkInterface(implementation_, _IATK_TOKEN_FACTORY_ID);

        tokenFactoryImplementationsByType[factoryTypeHash] = implementation_;
        emit TokenFactoryImplementationUpdated(_msgSender(), factoryTypeHash, implementation_);
    }

    /// @notice Returns the implementation address for a given factory type
    /// @param factoryTypeHash The type hash of the factory
    /// @return The implementation contract address
    function implementation(bytes32 factoryTypeHash) public view override returns (address) {
        return tokenFactoryImplementationsByType[factoryTypeHash];
    }

    /// @notice Returns the proxy address for a given factory type
    /// @param factoryTypeHash The type hash of the factory
    /// @return The factory proxy contract address
    function tokenFactory(bytes32 factoryTypeHash) public view override returns (address) {
        return tokenFactoryProxiesByType[factoryTypeHash];
    }

    /// @notice Checks if a contract implements the required interface
    /// @param implAddress The address of the contract to check
    /// @param interfaceId The interface ID to verify
    /// @dev Reverts if the contract doesn't implement the interface
    function _checkInterface(address implAddress, bytes4 interfaceId) private view {
        if (implAddress == address(0)) return;
        try IERC165(implAddress).supportsInterface(interfaceId) returns (bool supported) {
            if (!supported) {
                revert InvalidImplementationInterface(implAddress, interfaceId);
            }
        } catch {
            revert InvalidImplementationInterface(implAddress, interfaceId);
        }
    }

    /// @notice Checks if the contract supports a given interface
    /// @param interfaceId The interface identifier to check
    /// @return bool True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlUpgradeable, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId) || interfaceId == type(IATKTokenFactoryRegistry).interfaceId
            || interfaceId == type(IATKTypedImplementationRegistry).interfaceId;
    }

    /// @notice Returns the address of the current message sender
    /// @return The address of the message sender, accounting for meta-transactions
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
        return super._msgSender();
    }

    /// @notice Returns the calldata of the current transaction
    /// @return The calldata, accounting for meta-transactions
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    /// @notice Returns the length of the context suffix for meta-transactions
    /// @return The length of the context suffix
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }

    /// @notice Safely retrieves the registered interfaces of a token implementation
    /// @param _tokenImplementation The address of the token implementation to query
    /// @return An array of interface IDs supported by the token, or empty array if not supported
    /// @dev This function is used to avoid reverts when the token implementation is not a IERC165 contract.
    function _getRegisteredInterfacesSafely(address _tokenImplementation) private view returns (bytes4[] memory) {
        // Attempt to call supportsInterface on the _tokenImplementation.
        // The `try` block handles potential reverts if _tokenImplementation is not a contract,
        // or if it's a contract that doesn't implement IERC165 or its supportsInterface function.
        try IERC165(_tokenImplementation).supportsInterface(type(ISMART).interfaceId) returns (bool isSmartSupported) {
            // If supportsInterface call succeeds and returns true for ISMART interfaceId
            if (isSmartSupported) {
                // Now, try to call registeredInterfaces() on the ISMART interface.
                // This nested try-catch handles cases where the token might claim ISMART support
                // but its registeredInterfaces() function might still revert for some reason.
                try ISMART(_tokenImplementation).registeredInterfaces() returns (bytes4[] memory interfaces) {
                    return interfaces;
                } catch {
                    // If registeredInterfaces() reverts, return an empty array.
                    return new bytes4[](0);
                }
            } else {
                // If supportsInterface returns false for ISMART interfaceId, return an empty array.
                return new bytes4[](0);
            }
        } catch {
            // If supportsInterface call itself reverts (e.g., _tokenImplementation is not a contract,
            // or doesn't have the supportsInterface function), return an empty array.
            return new bytes4[](0);
        }
    }
}
