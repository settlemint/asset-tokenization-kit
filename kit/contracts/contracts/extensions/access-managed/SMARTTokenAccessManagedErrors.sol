// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Custom Errors for SMART Token Access Management
/// @notice This file defines custom errors that can be emitted by contracts related to
///         SMART token access management. Using custom errors is a gas-efficient way
///         to provide detailed reasons for failed transactions, as opposed to using
///         long string messages with `require` statements.

/**
 * @dev Error: Account Lacks Required Role.
 *      This error is emitted when an action is attempted by an account (`account`)
 *      that does not possess the necessary authorization role (`neededRole`).
 *      For example, if an account tries to mint new tokens but doesn't have the 'MINTER_ROLE'.
 * @notice This error is functionally identical to `AccessControlUnauthorizedAccount`
 *         defined in OpenZeppelin's `access/AccessControl.sol` contract.
 *         Re-defining it here ensures consistency within the SMART framework and can
 *         help in scenarios where specific error catching is needed for this module.
 * @param account The address of the account that attempted the unauthorized action.
 * @param neededRole The `bytes32` identifier of the role that the `account` was missing.
 */
error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);
