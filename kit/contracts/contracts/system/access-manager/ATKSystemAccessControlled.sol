// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// Local imports
import { ATKSystemRoles } from "../ATKSystemRoles.sol";
import { IATKSystemAccessManager } from "./IATKSystemAccessManager.sol";

/// @title ATK System Access Controlled Base Contract
/// @notice Base contract providing access control modifiers for system components
/// @dev This contract should be inherited by system contracts that need centralized access control
///      It implements the onlyRoles pattern specified in the requirements
abstract contract ATKSystemAccessControlled {
    // ================================
    // STATE VARIABLES
    // ================================

    /// @notice The centralized system access manager
    /// @dev All access control checks are delegated to this contract
    IATKSystemAccessManager public systemAccessManager;

    // ================================
    // EVENTS
    // ================================

    /// @notice Emitted when the system access manager is updated
    /// @param oldManager The previous access manager address
    /// @param newManager The new access manager address
    event SystemAccessManagerUpdated(address indexed oldManager, address indexed newManager);

    // ================================
    // ERRORS
    // ================================

    /// @notice Thrown when no valid role is found for an operation
    error NoValidRoleFound();

    /// @notice Thrown when the system access manager is not set
    error SystemAccessManagerNotSet();

    /// @notice Thrown when trying to set a zero address as access manager
    error ZeroAddressNotAllowed();

    // ================================
    // MODIFIERS
    // ================================

    /// @notice Modifier that checks if the caller has any of the specified roles
    /// @dev Implements the onlyRoles pattern from the requirements
    /// @param managerRole The manager role to check
    /// @param moduleRoles Array of module roles to check
    modifier onlyRoles(bytes32 managerRole, bytes32[] memory moduleRoles) {
        if (address(systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        // Check if caller has the manager role
        if (systemAccessManager.hasRole(managerRole, msg.sender)) {
            _;
            return;
        }

        // Check if caller has any of the module roles
        for (uint256 i = 0; i < moduleRoles.length; i++) {
            if (systemAccessManager.hasRole(moduleRoles[i], msg.sender)) {
                _;
                return;
            }
        }

        // If no valid role found, revert
        revert NoValidRoleFound();
    }

    /// @notice Modifier that checks if the caller has the manager role OR system module role
    /// @dev Convenience modifier for common access pattern
    /// @param managerRole The specific manager role to check
    modifier onlyManagerOrSystemModule(bytes32 managerRole) {
        if (address(systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (
            systemAccessManager.hasRole(managerRole, msg.sender)
                || systemAccessManager.hasRole(ATKSystemRoles.SYSTEM_MODULE_ROLE, msg.sender)
        ) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    /// @notice Modifier for system-wide operations requiring system manager or system module role
    modifier onlySystemManagerOrModule() {
        if (address(systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (
            systemAccessManager.hasRole(ATKSystemRoles.SYSTEM_MANAGER_ROLE, msg.sender)
                || systemAccessManager.hasRole(ATKSystemRoles.SYSTEM_MODULE_ROLE, msg.sender)
        ) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    /// @notice Modifier for identity management operations
    modifier onlyIdentityManagerOrModule() {
        bytes32[] memory moduleRoles = new bytes32[](1);
        moduleRoles[0] = ATKSystemRoles.IDENTITY_REGISTRY_MODULE_ROLE;

        if (address(systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (
            systemAccessManager.hasRole(ATKSystemRoles.IDENTITY_MANAGER_ROLE, msg.sender)
                || systemAccessManager.hasRole(ATKSystemRoles.IDENTITY_REGISTRY_MODULE_ROLE, msg.sender)
        ) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    /// @notice Modifier for token management operations
    modifier onlyTokenManagerOrModule() {
        if (address(systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (
            systemAccessManager.hasRole(ATKSystemRoles.TOKEN_MANAGER_ROLE, msg.sender)
                || systemAccessManager.hasRole(ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE, msg.sender)
        ) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    /// @notice Modifier for compliance management operations
    modifier onlyComplianceManagerOrModule() {
        if (address(systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (systemAccessManager.hasRole(ATKSystemRoles.COMPLIANCE_MANAGER_ROLE, msg.sender)) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    /// @notice Modifier for claim policy management operations
    modifier onlyClaimPolicyManagerOrModule() {
        if (address(systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (systemAccessManager.hasRole(ATKSystemRoles.CLAIM_POLICY_MANAGER_ROLE, msg.sender)) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    /// @notice Modifier for addon management operations
    modifier onlyAddonManagerOrModule() {
        if (address(systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (
            systemAccessManager.hasRole(ATKSystemRoles.ADDON_MANAGER_ROLE, msg.sender)
                || systemAccessManager.hasRole(ATKSystemRoles.ADDON_MODULE_ROLE, msg.sender)
        ) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    /// @notice Modifier for auditor access (read-only operations)
    modifier onlyAuditor() {
        if (address(systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (systemAccessManager.hasRole(ATKSystemRoles.AUDITOR_ROLE, msg.sender)) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    /// @notice Modifier for default admin operations
    modifier onlyDefaultAdmin() {
        if (address(systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (systemAccessManager.hasRole(ATKSystemRoles.DEFAULT_ADMIN_ROLE, msg.sender)) {
            _;
            return;
        }
        revert NoValidRoleFound();
    }

    // ================================
    // INTERNAL FUNCTIONS
    // ================================

    /// @notice Internal function to set the system access manager
    /// @dev Should be called during initialization of inheriting contracts
    /// @param _systemAccessManager The address of the system access manager
    function _setSystemAccessManager(address _systemAccessManager) internal {
        if (_systemAccessManager == address(0)) revert ZeroAddressNotAllowed();

        address oldManager = address(systemAccessManager);
        systemAccessManager = IATKSystemAccessManager(_systemAccessManager);

        emit SystemAccessManagerUpdated(oldManager, _systemAccessManager);
    }

    // ================================
    // VIEW FUNCTIONS
    // ================================

    /// @notice Checks if an account has a specific role
    /// @param role The role to check
    /// @param account The account to check
    /// @return True if the account has the role
    function hasRole(bytes32 role, address account) public view returns (bool) {
        if (address(systemAccessManager) == address(0)) return false;
        return systemAccessManager.hasRole(role, account);
    }

    /// @notice Checks if an account has any of the specified roles
    /// @param account The address to check
    /// @param roles The roles to check for
    /// @return True if the account has any of the specified roles
    function hasAnyRole(address account, bytes32[] calldata roles) public view returns (bool) {
        if (address(systemAccessManager) == address(0)) return false;
        return systemAccessManager.hasAnyRole(account, roles);
    }

    /// @notice Checks if an account has all of the specified roles
    /// @param account The address to check
    /// @param roles The roles to check for
    /// @return True if the account has all of the specified roles
    function hasAllRoles(address account, bytes32[] calldata roles) public view returns (bool) {
        if (address(systemAccessManager) == address(0)) return false;
        return systemAccessManager.hasAllRoles(account, roles);
    }
}
