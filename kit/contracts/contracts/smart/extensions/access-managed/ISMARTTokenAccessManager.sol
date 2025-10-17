// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

/// @title Interface for the SMART Token Access Control Manager
/// @author SettleMint
/// @notice This interface defines the essential functions that a dedicated Access Control Manager
///         contract must implement for the SMART token ecosystem. SMART token contracts
///         that are "access managed" will delegate their authorization checks to a contract
///         that implements this interface.
///         In Solidity, an interface specifies function signatures (name, parameters, return types)
///         without providing the actual code (implementation). This allows different contracts
///         to interact with each other in a standardized way.
/// @dev This interface primarily focuses on the `hasRole` function, which is the core of
///      role-based access control. It also inherits from OpenZeppelin's `IAccessControl`
///      interface, which can be useful for broader compatibility, though `IAccessControl`
///      itself also primarily defines `hasRole` along with events and other role management functions
///      that are typically implemented by a full AccessControl contract, not just its interface.
interface ISMARTTokenAccessManager is IAccessControl {
    // Note: IAccessControl itself also has hasRole. Redundancy for clarity or specific needs.
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

    /// @notice Grants `role` to each address in `accounts`.
    /// @param role The role identifier to grant.
    /// @param accounts The addresses that will receive the role.
    function batchGrantRole(bytes32 role, address[] calldata accounts) external;

    /// @notice Revokes `role` from each address in `accounts`.
    /// @param role The role identifier to revoke.
    /// @param accounts The addresses that will lose the role.
    function batchRevokeRole(bytes32 role, address[] calldata accounts) external;

    /// @notice Grants multiple roles to a single account.
    /// @param account The address that will receive all the roles.
    /// @param roles The array of role identifiers to grant.
    function grantMultipleRoles(address account, bytes32[] calldata roles) external;

    /// @notice Revokes multiple roles from a single account.
    /// @param account The address that will lose all the roles.
    /// @param roles The array of role identifiers to revoke.
    function revokeMultipleRoles(address account, bytes32[] calldata roles) external;

    /// @notice Renounces multiple roles from the calling account.
    /// @param roles The array of role identifiers to renounce.
    /// @param callerConfirmation The address that will confirm the renouncement.
    function renounceMultipleRoles(bytes32[] calldata roles, address callerConfirmation) external;
}
