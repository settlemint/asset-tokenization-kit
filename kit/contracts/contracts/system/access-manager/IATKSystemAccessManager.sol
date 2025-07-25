// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

/// @title Interface for the ATK System Access Manager
/// @notice This interface defines the essential functions that a dedicated Access Control Manager
///         contract must implement for the ATK system. The ATK system is a collection of contracts
///         that work together to manage the system.
/// @dev This interface primarily focuses on the `hasRole` function, which is the core of
///      role-based access control. It also inherits from OpenZeppelin's `IAccessControl`
///      interface, which can be useful for broader compatibility, though `IAccessControl`
///      itself also primarily defines `hasRole` along with events and other role management functions
///      that are typically implemented by a full AccessControl contract, not just its interface.
interface IATKSystemAccessManager is IAccessControl {
    /// @notice Checks if a given account possesses a specific role.
    /// @dev This is the primary function that token contracts will call to determine if an
    ///      action requested by an `account` is permitted based on its assigned `role`.
    ///      The implementation of this function within the manager contract will contain
    ///      the logic for storing and retrieving role assignments.
    /// @param role The `bytes32` identifier of the role in question (e.g., MINTER_ROLE, PAUSER_ROLE).
    ///             A `bytes32` is a 32-byte fixed-size array, often used to store hashes or short strings.
    /// @param account The blockchain address of the account whose roles are being queried.
    /// @return A boolean value: `true` if the `account` has the specified `role`, `false` otherwise.
    function hasRole(bytes32 role, address account) external view returns (bool);

    /// @notice Checks if a given account possesses any of the specified roles.
    /// @dev This function is used to check if an account has at least one role from a list of roles.
    ///      This enables the onlyRoles modifier pattern where a function can be accessed by
    ///      accounts with a MANAGER_ROLE or any of the SYSTEM_ROLES.
    /// @param roles Array of role identifiers to check
    /// @param account The blockchain address of the account whose roles are being queried.
    /// @return A boolean value: `true` if the `account` has at least one of the specified `roles`, `false` otherwise.
    function hasAnyRole(bytes32[] calldata roles, address account) external view returns (bool);

    /// @notice Grants `role` to each address in `accounts`.
    /// @param role The role identifier to grant.
    /// @param accounts The addresses that will receive the role.
    function batchGrantRole(bytes32 role, address[] calldata accounts) external;

    /// @notice Revokes `role` from each address in `accounts`.
    /// @param role The role identifier to revoke.
    /// @param accounts The addresses that will lose the role.
    function batchRevokeRole(bytes32 role, address[] calldata accounts) external;

    /// @notice Grants `role` to an address.
    /// @param role The role identifier to grant.
    /// @param account The address that will receive the role.
    function grantRole(bytes32 role, address account) external;

    /// @notice Revokes `role` from an address.
    /// @param role The role identifier to revoke.
    /// @param account The address that will lose the role.
    function revokeRole(bytes32 role, address account) external;

    /// @notice Renounces a role from an address.
    /// @param role The role identifier to renounce.
    /// @param account The address that will renounce the role.
    function renounceRole(bytes32 role, address account) external;
}
