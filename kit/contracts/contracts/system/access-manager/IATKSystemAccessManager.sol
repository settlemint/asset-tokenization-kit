// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin imports
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

/// @title Interface for ATK System Access Manager
/// @notice Interface defining the centralized access control functionality for the ATK system
/// @dev Extends OpenZeppelin's IAccessControl with additional system-specific functionality
interface IATKSystemAccessManager is IAccessControl {
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
    // INITIALIZATION
    // ================================

    /// @notice Initializes the system access manager
    /// @dev Sets up the initial admin and establishes role hierarchy
    /// @param initialAdmin Address of the initial admin for the system
    function initialize(address initialAdmin) external;

    // ================================
    // BATCH ROLE MANAGEMENT
    // ================================

    /// @notice Grants multiple roles to a single account
    /// @dev Requires the caller to have admin role for each role being granted
    /// @param account The address that will receive all the roles
    /// @param roles The array of role identifiers to grant
    function grantMultipleRoles(address account, bytes32[] calldata roles) external;

    /// @notice Revokes multiple roles from a single account
    /// @dev Requires the caller to have admin role for each role being revoked
    /// @param account The address that will lose all the roles
    /// @param roles The array of role identifiers to revoke
    function revokeMultipleRoles(address account, bytes32[] calldata roles) external;

    /// @notice Grants a role to multiple accounts
    /// @dev Requires the caller to have admin role for the role being granted
    /// @param role The role identifier to grant
    /// @param accounts The addresses that will receive the role
    function batchGrantRole(bytes32 role, address[] calldata accounts) external;

    /// @notice Revokes a role from multiple accounts
    /// @dev Requires the caller to have admin role for the role being revoked
    /// @param role The role identifier to revoke
    /// @param accounts The addresses that will lose the role
    function batchRevokeRole(bytes32 role, address[] calldata accounts) external;

    // ================================
    // ROLE QUERY FUNCTIONS
    // ================================

    /// @notice Checks if an account has any of the specified roles
    /// @param account The address to check
    /// @param roles The roles to check for
    /// @return hasAnyRole True if the account has any of the specified roles
    function hasAnyRole(address account, bytes32[] calldata roles) external view returns (bool hasAnyRole);

    /// @notice Checks if an account has all of the specified roles
    /// @param account The address to check
    /// @param roles The roles to check for
    /// @return hasAllRoles True if the account has all of the specified roles
    function hasAllRoles(address account, bytes32[] calldata roles) external view returns (bool hasAllRoles);

    /// @notice Returns all manager roles for enumeration
    /// @return Array of all manager role identifiers
    function getAllManagerRoles() external pure returns (bytes32[] memory);

    /// @notice Returns all module roles for enumeration
    /// @return Array of all module role identifiers
    function getAllModuleRoles() external pure returns (bytes32[] memory);
}
