// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Custom Errors for SMART Pausable Extension
/// @author SettleMint
/// @notice Defines custom errors specific to the pausable functionality of SMART tokens.
/// @dev Using custom errors (`error TokenPaused();`) is more gas-efficient than `require(condition, "string reason");`
///      and provides a clear way to signal specific failure conditions related to the paused state.
