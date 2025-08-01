// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ZeroAddressNotAllowed } from "../ATKSystemErrors.sol";
import { IATKSystemAccessManager } from "./IATKSystemAccessManager.sol";

/// @title Interface for ATK System Access Management
/// @author SettleMint
/// @notice This interface defines the methods that must be implemented by contracts that manage access to the ATK
/// system.
///         It provides a way to check if an account has a specific role and to get the address of the access manager.
///         This interface is used to avoid code duplication between the standard and upgradeable versions of an
/// extension
///         and to promote modularity.
/// @dev This interface is not meant to be deployed directly but rather inherited by `ATKSystemAccessManaged` and
///      `ATKSystemAccessManagedUpgradeable` contracts.
///      It implements access management by delegating `hasRole` checks to the configured `_accessManager`.
interface IATKSystemAccessManaged {
    /// @notice Emitted when the access manager is set.
    /// @param sender The address that set the access manager.
    /// @param accessManager The address of the access manager.
    event AccessManagerSet(address indexed sender, address indexed accessManager);

    /// @dev Error: Account Lacks Required Role.
    ///      This error is emitted when an action is attempted by an account (`account`)
    ///      that does not possess the necessary authorization role (`neededRole`).
    ///      For example, if an account tries to perform a system operation but doesn't have the required role.
    /// @notice This error is functionally identical to `AccessControlUnauthorizedAccount`
    ///         defined in OpenZeppelin's `access/AccessControl.sol` contract.
    ///         Re-defining it here ensures consistency within the ATK framework and can
    ///         help in scenarios where specific error catching is needed for this module.
    /// @param account The address of the account that attempted the unauthorized action.
    /// @param neededRole The `bytes32` identifier of the role that the `account` was missing.
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

    /// @notice Returns the address of the access manager
    /// @return The address of the access manager
    function accessManager() external view returns (address);

    /// @notice Checks if an account has a specific role
    /// @param role The role to check
    /// @param account The account to check
    /// @return True if the account has the role, false otherwise
    function hasSystemRole(bytes32 role, address account) external view returns (bool);
}
