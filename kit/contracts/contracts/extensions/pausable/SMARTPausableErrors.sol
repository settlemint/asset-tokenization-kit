// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Custom Errors for SMART Pausable Extension
/// @notice Defines custom errors specific to the pausable functionality of SMART tokens.
/// @dev Using custom errors (`error TokenPaused();`) is more gas-efficient than `require(condition, "string reason");`
///      and provides a clear way to signal specific failure conditions related to the paused state.

/// @notice Error reverted when an action is attempted that requires the contract to be unpaused (not paused),
///         but the contract is currently paused.
/// @dev For example, this error is typically used in a `whenNotPaused` modifier if a function like `transfer`
///      is called while the token operations are halted.
error TokenPaused();

/// @notice Error reverted when an action is attempted that requires the contract to be in a paused state,
///         but the contract is currently not paused (i.e., it is unpaused).
/// @dev For example, this might be used if an `unpause()` function is called when the contract is already unpaused,
///      or if a specific admin action is only allowed during a maintenance (paused) period.
error ExpectedPause();
