// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin imports
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

/// @title Interface for ATK System Access Manager
/// @notice Defines the contract interface for centralized access control in the ATK system
interface IATKSystemAccessManager is IAccessControl {
    // ================================
    // ROLE MANAGEMENT FUNCTIONS
    // ================================

    /// @notice Grants multiple roles to a single account
    /// @param account The address that will receive all the roles
    /// @param roles The array of role identifiers to grant
    function grantMultipleRoles(address account, bytes32[] calldata roles) external;

    /// @notice Revokes multiple roles from a single account
    /// @param account The address that will lose all the roles
    /// @param roles The array of role identifiers to revoke
    function revokeMultipleRoles(address account, bytes32[] calldata roles) external;

    /// @notice Grants a role to multiple accounts
    /// @param role The role identifier to grant
    /// @param accounts The addresses that will receive the role
    function batchGrantRole(bytes32 role, address[] calldata accounts) external;

    /// @notice Revokes a role from multiple accounts
    /// @param role The role identifier to revoke
    /// @param accounts The addresses that will lose the role
    function batchRevokeRole(bytes32 role, address[] calldata accounts) external;

    // ================================
    // ROLE QUERY FUNCTIONS
    // ================================

    /// @notice Checks if an account has any of the specified roles
    /// @param account The address to check
    /// @param roles The roles to check for
    /// @return result True if the account has any of the specified roles
    function hasAnyRole(address account, bytes32[] calldata roles) external view returns (bool result);

    /// @notice Checks if an account has all of the specified roles
    /// @param account The address to check
    /// @param roles The roles to check for
    /// @return result True if the account has all of the specified roles
    function hasAllRoles(address account, bytes32[] calldata roles) external view returns (bool result);

    /// @notice Returns all manager roles for enumeration
    /// @return Array of all manager role identifiers
    function getAllManagerRoles() external pure returns (bytes32[] memory);

    /// @notice Returns all module roles for enumeration
    /// @return Array of all module role identifiers
    function getAllModuleRoles() external pure returns (bytes32[] memory);

    /// @notice Checks if an account has a managerRole or any of the moduleRoles
    /// @dev This function can be used by both implementation and controlled contracts
    /// @param account The address to check
    /// @param managerRole The manager role to check
    /// @param moduleRoles Array of module roles to check
    /// @return hasPermission True if the account has required permissions, false otherwise
    /// @return authorizedRole The first role that granted permission, or empty if no permission
    function checkRoles(
        address account,
        bytes32 managerRole,
        bytes32[] memory moduleRoles
    )
        external
        view
        returns (bool hasPermission, bytes32 authorizedRole);
}
