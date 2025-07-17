// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin imports
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

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
    IATKSystemAccessManager private _systemAccessManager;

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
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        (bool hasPermission,) = _systemAccessManager.checkRoles(msg.sender, managerRole, moduleRoles);

        if (!hasPermission) {
            revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, managerRole);
        }

        _;
    }

    /// @notice Modifier that checks if the caller has the manager role OR system module role
    /// @dev Convenience modifier for common access pattern
    /// @param managerRole The specific manager role to check
    modifier onlyManagerOrSystemModule(bytes32 managerRole) {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (
            _systemAccessManager.hasRole(managerRole, msg.sender)
                || _systemAccessManager.hasRole(ATKSystemRoles.SYSTEM_MODULE_ROLE, msg.sender)
        ) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, managerRole);
    }

    /// @notice Modifier for system-wide operations requiring system manager or system module role
    modifier onlySystemManagerOrModule() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (
            _systemAccessManager.hasRole(ATKSystemRoles.SYSTEM_MANAGER_ROLE, msg.sender)
                || _systemAccessManager.hasRole(ATKSystemRoles.SYSTEM_MODULE_ROLE, msg.sender)
        ) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.SYSTEM_MANAGER_ROLE);
    }

    /// @notice Modifier for operations requiring only system manager role (more restrictive)
    /// @dev Use this for critical operations that should not be accessible to system modules
    modifier onlySystemManager() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (_systemAccessManager.hasRole(ATKSystemRoles.SYSTEM_MANAGER_ROLE, msg.sender)) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.SYSTEM_MANAGER_ROLE);
    }

    /// @notice Modifier for identity management operations
    modifier onlyIdentityManagerOrModule() {
        bytes32[] memory moduleRoles = new bytes32[](1);
        moduleRoles[0] = ATKSystemRoles.IDENTITY_REGISTRY_MODULE_ROLE;

        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (
            _systemAccessManager.hasRole(ATKSystemRoles.IDENTITY_MANAGER_ROLE, msg.sender)
                || _systemAccessManager.hasRole(ATKSystemRoles.IDENTITY_REGISTRY_MODULE_ROLE, msg.sender)
        ) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.IDENTITY_MANAGER_ROLE);
    }

    /// @notice Modifier for token management operations
    modifier onlyTokenManagerOrModule() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (
            _systemAccessManager.hasRole(ATKSystemRoles.TOKEN_MANAGER_ROLE, msg.sender)
                || _systemAccessManager.hasRole(ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE, msg.sender)
        ) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.TOKEN_MANAGER_ROLE);
    }

    /// @notice Modifier for compliance management operations
    modifier onlyComplianceManagerOrModule() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (_systemAccessManager.hasRole(ATKSystemRoles.COMPLIANCE_MANAGER_ROLE, msg.sender)) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.COMPLIANCE_MANAGER_ROLE);
    }

    /// @notice Modifier for bypass list management operations
    modifier onlyBypassListManager() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (_systemAccessManager.hasRole(ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, msg.sender)) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE);
    }

    /// @notice Modifier for claim policy management operations
    modifier onlyClaimPolicyManagerOrModule() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (_systemAccessManager.hasRole(ATKSystemRoles.CLAIM_POLICY_MANAGER_ROLE, msg.sender)) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.CLAIM_POLICY_MANAGER_ROLE);
    }

    /// @notice Modifier for addon management operations
    modifier onlyAddonManagerOrModule() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (
            _systemAccessManager.hasRole(ATKSystemRoles.ADDON_MANAGER_ROLE, msg.sender)
                || _systemAccessManager.hasRole(ATKSystemRoles.ADDON_MODULE_ROLE, msg.sender)
        ) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.ADDON_MANAGER_ROLE);
    }

    /// @notice Modifier for auditor access (read-only operations)
    modifier onlyAuditor() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (_systemAccessManager.hasRole(ATKSystemRoles.AUDITOR_ROLE, msg.sender)) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.AUDITOR_ROLE);
    }

    /// @notice Modifier for default admin operations
    modifier onlyDefaultAdmin() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (_systemAccessManager.hasRole(ATKSystemRoles.DEFAULT_ADMIN_ROLE, msg.sender)) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.DEFAULT_ADMIN_ROLE);
    }

    /// @notice Modifier for registrar operations
    modifier onlyRegistrar() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (_systemAccessManager.hasRole(ATKSystemRoles.REGISTRAR_ROLE, msg.sender)) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.REGISTRAR_ROLE);
    }

    /// @notice Modifier for implementation manager operations
    modifier onlyImplementationManager() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (_systemAccessManager.hasRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE, msg.sender)) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE);
    }

    /// @notice Modifier for deployer operations
    modifier onlyDeployer() {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();

        if (_systemAccessManager.hasRole(ATKSystemRoles.DEPLOYER_ROLE, msg.sender)) {
            _;
            return;
        }
        revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.DEPLOYER_ROLE);
    }

    // ================================
    // INTERNAL FUNCTIONS
    // ================================

    /// @notice Internal function to set the system access manager
    /// @dev Should be called during initialization of inheriting contracts
    /// @param _systemAccessManagerAddress The address of the system access manager
    function _setSystemAccessManager(address _systemAccessManagerAddress) internal {
        if (_systemAccessManagerAddress == address(0)) revert ZeroAddressNotAllowed();

        address oldManager = address(_systemAccessManager);
        _systemAccessManager = IATKSystemAccessManager(_systemAccessManagerAddress);

        emit SystemAccessManagerUpdated(oldManager, _systemAccessManagerAddress);
    }

    // ================================
    // PUBLIC FUNCTIONS
    // ================================

    /// @notice Sets the system access manager for centralized access control
    /// @dev Only callable by the default admin role
    /// @param _systemAccessManagerAddress The address of the system access manager
    function setSystemAccessManager(address _systemAccessManagerAddress) external virtual onlyDefaultAdmin {
        _setSystemAccessManager(_systemAccessManagerAddress);
    }

    // ================================
    // VIEW FUNCTIONS
    // ================================

    /// @notice Gets the system access manager address
    /// @return The address of the system access manager
    function getSystemAccessManager() public view returns (address) {
        return address(_systemAccessManager);
    }

    /// @notice Checks if an account has a specific role
    /// @param role The role to check
    /// @param account The account to check
    /// @return True if the account has the role
    function hasRole(bytes32 role, address account) public view virtual returns (bool) {
        if (address(_systemAccessManager) == address(0)) return false;
        return _systemAccessManager.hasRole(role, account);
    }

    /// @notice Checks if an account has any of the specified roles
    /// @param account The address to check
    /// @param roles The roles to check for
    /// @return True if the account has any of the specified roles
    function hasAnyRole(address account, bytes32[] calldata roles) public view returns (bool) {
        if (address(_systemAccessManager) == address(0)) return false;
        return _systemAccessManager.hasAnyRole(account, roles);
    }

    /// @notice Checks if an account has all of the specified roles
    /// @param account The address to check
    /// @param roles The roles to check for
    /// @return True if the account has all of the specified roles
    function hasAllRoles(address account, bytes32[] calldata roles) public view returns (bool) {
        if (address(_systemAccessManager) == address(0)) return false;
        return _systemAccessManager.hasAllRoles(account, roles);
    }
}
