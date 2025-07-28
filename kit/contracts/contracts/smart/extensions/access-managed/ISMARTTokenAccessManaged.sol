// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for SMART Token Access Management
/// @author SettleMint
/// @notice This interface defines the functions that a contract must implement
///         to be considered compatible with the SMART token access management system.
///         In Solidity, an interface is like a contract blueprint. It specifies
///         what functions a contract has, but not how they are implemented.
///         Other contracts can then interact with any contract that implements this
///         interface, knowing that these functions will be available.
interface ISMARTTokenAccessManaged {
    /// @dev Error: Account Lacks Required Role.
    ///      This error is emitted when an action is attempted by an account (`account`)
    ///      that does not possess the necessary authorization role (`neededRole`).
    ///      For example, if an account tries to mint new tokens but doesn't have the 'MINTER_ROLE'.
    /// @notice This error is functionally identical to `AccessControlUnauthorizedAccount`
    ///         defined in OpenZeppelin's `access/AccessControl.sol` contract.
    ///         Re-defining it here ensures consistency within the SMART framework and can
    ///         help in scenarios where specific error catching is needed for this module.
    /// @param account The address of the account that attempted the unauthorized action.
    /// @param neededRole The `bytes32` identifier of the role that the `account` was missing.
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

    /// @notice Emitted when the address of the access manager contract is successfully changed or set.
    /// @dev This event is crucial for transparency and monitoring. It allows external observers
    ///      to know when the authority managing roles and permissions for a token has been updated.
    ///      The `indexed` keyword for `sender` and `manager` allows these addresses to be efficiently
    ///      searched for in event logs.
    /// @param sender The address of the account that initiated the change of the access manager.
    ///               This is typically an administrator or an account with special privileges.
    /// @param manager The new address of the `SMARTTokenAccessManager` contract that will now
    ///                oversee access control for the token.
    event AccessManagerSet(address indexed sender, address indexed manager);

    /// @notice Checks if a given account has a specific role.
    /// @dev This function is crucial for permissioned systems, where certain actions
    ///      can only be performed by accounts holding specific roles (e.g., an admin role,
    ///      a minter role, etc.).
    /// @param role The identifier of the role to check. Roles are typically represented
    ///             as a `bytes32` value, which is a fixed-size byte array often derived
    ///             from a descriptive string (e.g., keccak256("MINTER_ROLE")).
    /// @param account The address of the account whose roles are being checked.
    /// @return A boolean value: `true` if the account has the specified role,
    ///         `false` otherwise.
    function hasRole(bytes32 role, address account) external view returns (bool);

    /// @notice Returns the address of the access manager for the token.
    /// @return The address of the access manager.
    function accessManager() external view returns (address);
}
