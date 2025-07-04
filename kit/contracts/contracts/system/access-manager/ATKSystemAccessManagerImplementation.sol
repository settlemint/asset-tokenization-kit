// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

// Local imports
import { ATKSystemRoles } from "../ATKSystemRoles.sol";

/// @title Centralized Access Control Manager for ATK System (Upgradeable)
/// @notice This contract provides centralized access control for the entire ATK system,
///         managing both People roles (MANAGER_ROLE) and System roles (MODULE_ROLE)
/// @dev This contract implements the role hierarchy defined in the ATK System requirements:
///      - People roles (*_MANAGER_ROLE): Human operators with specific responsibilities
///      - System roles (*_MODULE_ROLE): System components with specific permissions
///      It supports the onlyRoles modifier pattern for flexible access control
contract ATKSystemAccessManagerImplementation is Initializable, AccessControlUpgradeable, ERC2771ContextUpgradeable {
    // ================================
    // EVENTS
    // ================================

    /// @notice Emitted when a role hierarchy is established
    /// @param adminRole The admin role for the managed role
    /// @param managedRole The role being managed
    event RoleHierarchyEstablished(bytes32 indexed adminRole, bytes32 indexed managedRole);

    /// @notice Emitted when multiple roles are granted to an account
    /// @param account The account receiving the roles
    /// @param roles The roles being granted
    event MultipleRolesGranted(address indexed account, bytes32[] roles);

    /// @notice Emitted when multiple roles are revoked from an account
    /// @param account The account losing the roles
    /// @param roles The roles being revoked
    event MultipleRolesRevoked(address indexed account, bytes32[] roles);

    // ================================
    // ERRORS
    // ================================

    /// @notice Thrown when no valid role is found for an operation
    error NoValidRoleFound();

    /// @notice Thrown when arrays have mismatched lengths
    error ArrayLengthMismatch();

    /// @notice Thrown when an empty array is provided
    error EmptyArray();

    // ================================
    // CONSTRUCTOR & INITIALIZER
    // ================================

    /// @notice Constructor for the ATKSystemAccessManager
    /// @dev Initializes the contract with a forwarder address for meta-transactions
    /// @param forwarder The address of the trusted forwarder contract
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the system access manager
    /// @dev Sets up the initial admin and establishes role hierarchy
    /// @param initialAdmin Address of the initial admin for the system
    function initialize(address initialAdmin) public initializer {
        __AccessControl_init();

        // Grant the default admin role to the initial admin
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);

        // Establish role hierarchy
        _establishRoleHierarchy();
    }

    // ================================
    // ACCESS CONTROL MODIFIERS
    // ================================

    /// @notice Modifier that checks if the caller has any of the specified roles
    /// @dev Implements the onlyRoles pattern from the requirements
    /// @param managerRole The manager role to check
    /// @param moduleRoles Array of module roles to check
    modifier onlyRoles(bytes32 managerRole, bytes32[] memory moduleRoles) {
        // Check if caller has the manager role
        if (hasRole(managerRole, _msgSender())) {
            _;
            return;
        }

        // Check if caller has any of the module roles
        for (uint256 i = 0; i < moduleRoles.length; i++) {
            if (hasRole(moduleRoles[i], _msgSender())) {
                _;
                return;
            }
        }

        // If no valid role found, revert
        revert NoValidRoleFound();
    }

    /// @notice Modifier that checks if the caller has the manager role OR any system module role
    /// @dev Convenience modifier for common access pattern
    /// @param managerRole The specific manager role to check
    modifier onlyManagerOrSystemModule(bytes32 managerRole) {
        if (hasRole(managerRole, _msgSender()) || hasRole(ATKSystemRoles.SYSTEM_MODULE_ROLE, _msgSender())) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    /// @notice Modifier for system-wide operations requiring system manager or system module role
    modifier onlySystemManagerOrModule() {
        bytes32[] memory moduleRoles = new bytes32[](1);
        moduleRoles[0] = ATKSystemRoles.SYSTEM_MODULE_ROLE;

        if (
            hasRole(ATKSystemRoles.SYSTEM_MANAGER_ROLE, _msgSender())
                || hasRole(ATKSystemRoles.SYSTEM_MODULE_ROLE, _msgSender())
        ) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    // ================================
    // BATCH ROLE MANAGEMENT
    // ================================

    /// @notice Grants multiple roles to a single account
    /// @dev Requires the caller to have admin role for each role being granted
    /// @param account The address that will receive all the roles
    /// @param roles The array of role identifiers to grant
    function grantMultipleRoles(address account, bytes32[] calldata roles) external {
        if (roles.length == 0) revert EmptyArray();

        for (uint256 i = 0; i < roles.length; i++) {
            grantRole(roles[i], account);
        }

        emit MultipleRolesGranted(account, roles);
    }

    /// @notice Revokes multiple roles from a single account
    /// @dev Requires the caller to have admin role for each role being revoked
    /// @param account The address that will lose all the roles
    /// @param roles The array of role identifiers to revoke
    function revokeMultipleRoles(address account, bytes32[] calldata roles) external {
        if (roles.length == 0) revert EmptyArray();

        for (uint256 i = 0; i < roles.length; i++) {
            revokeRole(roles[i], account);
        }

        emit MultipleRolesRevoked(account, roles);
    }

    /// @notice Grants a role to multiple accounts
    /// @dev Requires the caller to have admin role for the role being granted
    /// @param role The role identifier to grant
    /// @param accounts The addresses that will receive the role
    function batchGrantRole(bytes32 role, address[] calldata accounts) external {
        if (accounts.length == 0) revert EmptyArray();

        for (uint256 i = 0; i < accounts.length; i++) {
            grantRole(role, accounts[i]);
        }
    }

    /// @notice Revokes a role from multiple accounts
    /// @dev Requires the caller to have admin role for the role being revoked
    /// @param role The role identifier to revoke
    /// @param accounts The addresses that will lose the role
    function batchRevokeRole(bytes32 role, address[] calldata accounts) external {
        if (accounts.length == 0) revert EmptyArray();

        for (uint256 i = 0; i < accounts.length; i++) {
            revokeRole(role, accounts[i]);
        }
    }

    // ================================
    // ROLE QUERY FUNCTIONS
    // ================================

    /// @notice Checks if an account has any of the specified roles
    /// @param account The address to check
    /// @param roles The roles to check for
    /// @return hasAnyRole True if the account has any of the specified roles
    function hasAnyRole(address account, bytes32[] calldata roles) external view returns (bool hasAnyRole) {
        for (uint256 i = 0; i < roles.length; i++) {
            if (hasRole(roles[i], account)) {
                return true;
            }
        }
        return false;
    }

    /// @notice Checks if an account has all of the specified roles
    /// @param account The address to check
    /// @param roles The roles to check for
    /// @return hasAllRoles True if the account has all of the specified roles
    function hasAllRoles(address account, bytes32[] calldata roles) external view returns (bool hasAllRoles) {
        for (uint256 i = 0; i < roles.length; i++) {
            if (!hasRole(roles[i], account)) {
                return false;
            }
        }
        return true;
    }

    /// @notice Returns all manager roles for enumeration
    /// @return Array of all manager role identifiers
    function getAllManagerRoles() external pure returns (bytes32[] memory) {
        return ATKSystemRoles.getAllManagerRoles();
    }

    /// @notice Returns all module roles for enumeration
    /// @return Array of all module role identifiers
    function getAllModuleRoles() external pure returns (bytes32[] memory) {
        return ATKSystemRoles.getAllModuleRoles();
    }

    // ================================
    // INTERNAL FUNCTIONS
    // ================================

    /// @notice Establishes the role hierarchy for the system
    /// @dev Sets up role admin relationships as defined in the requirements
    function _establishRoleHierarchy() internal {
        // Set up manager role admins (DEFAULT_ADMIN_ROLE manages all manager roles)
        _setRoleAdmin(ATKSystemRoles.SYSTEM_MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ATKSystemRoles.IDENTITY_MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ATKSystemRoles.TOKEN_MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ATKSystemRoles.COMPLIANCE_MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ATKSystemRoles.ADDON_MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ATKSystemRoles.CLAIM_POLICY_MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ATKSystemRoles.AUDITOR_ROLE, DEFAULT_ADMIN_ROLE);

        // Set up module role admins (SYSTEM_MODULE_ROLE manages other module roles)
        _setRoleAdmin(ATKSystemRoles.SYSTEM_MODULE_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(ATKSystemRoles.IDENTITY_REGISTRY_MODULE_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE);
        _setRoleAdmin(ATKSystemRoles.TOKEN_FACTORY_REGISTRY_MODULE_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE);
        _setRoleAdmin(ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE, ATKSystemRoles.TOKEN_FACTORY_REGISTRY_MODULE_ROLE);
        _setRoleAdmin(ATKSystemRoles.ADDON_REGISTRY_MODULE_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE);
        _setRoleAdmin(ATKSystemRoles.ADDON_MODULE_ROLE, ATKSystemRoles.ADDON_REGISTRY_MODULE_ROLE);

        // Set up legacy role admins for backward compatibility
        _setRoleAdmin(ATKSystemRoles.REGISTRAR_ROLE, ATKSystemRoles.IDENTITY_MANAGER_ROLE);
        _setRoleAdmin(ATKSystemRoles.CLAIM_MANAGER_ROLE, ATKSystemRoles.CLAIM_POLICY_MANAGER_ROLE);
        _setRoleAdmin(ATKSystemRoles.DEPLOYER_ROLE, ATKSystemRoles.SYSTEM_MANAGER_ROLE);
        _setRoleAdmin(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MANAGER_ROLE);
        _setRoleAdmin(ATKSystemRoles.STORAGE_MODIFIER_ROLE, ATKSystemRoles.IDENTITY_REGISTRY_MODULE_ROLE);
        _setRoleAdmin(ATKSystemRoles.REGISTRY_MANAGER_ROLE, ATKSystemRoles.IDENTITY_MANAGER_ROLE);
        _setRoleAdmin(ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, ATKSystemRoles.COMPLIANCE_MANAGER_ROLE);
        _setRoleAdmin(ATKSystemRoles.BYPASS_LIST_MANAGER_ADMIN_ROLE, ATKSystemRoles.COMPLIANCE_MANAGER_ROLE);
    }

    // ================================
    // CONTEXT OVERRIDES (ERC2771)
    // ================================

    /// @notice Overrides the _msgSender() function to support meta-transactions via ERC2771
    /// @dev Ensures that access control checks are based on the actual user, not the forwarder
    /// @return The address of the original transaction initiator
    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address)
    {
        return super._msgSender();
    }

    /// @notice Overrides the _msgData() function to support meta-transactions via ERC2771
    /// @dev Retrieves the original call data when a transaction is relayed through a forwarder
    /// @return The original msg.data from the user's transaction
    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    /// @notice Overrides _contextSuffixLength for ERC2771 compatibility
    /// @dev Indicates if the calldata includes a suffix with the sender's address
    /// @return The length of the context suffix if present, otherwise 0
    function _contextSuffixLength()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }

    // ================================
    // INTERFACE SUPPORT
    // ================================

    /// @notice Declares support for interfaces
    /// @dev Supports ERC165 interface detection
    /// @param interfaceId The bytes4 identifier of the interface to check
    /// @return True if the contract supports the interface, false otherwise
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
