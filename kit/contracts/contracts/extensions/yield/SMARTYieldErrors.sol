// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Custom Errors for the SMART Yield Extension
/// @notice This file defines custom error types specific to the yield extension functionality.
/// Using custom errors (introduced in Solidity 0.8.4) is generally more gas-efficient than using `require` statements
/// with string messages.
/// They also allow for more structured error handling and can be caught by off-chain tools.

/// @notice Error indicating that a yield schedule has already been set for the token and an attempt was made to set it
/// again.
/// @dev This error is typically reverted when a function like `setYieldSchedule` is called but the token
/// already has an active or previously configured yield schedule. To change a schedule, it might need to be unset or
/// updated via a different mechanism if supported.
error YieldScheduleAlreadySet();

/// @notice Error indicating that an action cannot be performed because the yield schedule is currently active.
/// @dev For example, this might be reverted if an attempt is made to modify certain parameters of the token or the
/// yield mechanism
/// (like `_beforeMint` in `_SMARTYieldLogic` preventing minting) once the yield schedule has started (i.e.,
/// `schedule.startDate() <= block.timestamp`).
/// Some operations might be restricted to only occur before the yield schedule begins distributing rewards.
error YieldScheduleActive();
