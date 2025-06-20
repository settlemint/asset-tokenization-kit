// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

// --- Time-Bound Airdrop Specific Errors ---

/// @notice Thrown when attempting to claim before the airdrop has started.
error AirdropNotStarted();

/// @notice Thrown when attempting to claim after the airdrop has ended.
error AirdropEnded();

/// @notice Thrown when the provided start time is invalid (e.g., in the past).
error InvalidStartTime();

/// @notice Thrown when the provided end time is invalid (e.g., before start time).
error InvalidEndTime();

/// @notice Thrown when the time window configuration is invalid.
error InvalidTimeWindow();
