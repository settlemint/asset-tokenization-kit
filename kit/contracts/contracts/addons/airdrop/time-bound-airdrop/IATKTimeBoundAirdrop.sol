// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { IATKAirdrop } from "../IATKAirdrop.sol";

/// @title IATKTimeBoundAirdrop
/// @author SettleMint Tokenization Services
/// @notice Interface for time-bound airdrop contracts in the ATK Protocol.
/// @dev Defines the functions specific to time-bound airdrops where claims are restricted to a specific time window.
interface IATKTimeBoundAirdrop is IATKAirdrop {
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

    // --- View Functions ---

    /// @notice Returns the start time when claims become available.
    /// @return The timestamp when claims can begin.
    function startTime() external view returns (uint256);

    /// @notice Returns the end time when claims are no longer available.
    /// @return The timestamp when claims end.
    function endTime() external view returns (uint256);

    /// @notice Checks if the airdrop is currently active (within the time window).
    /// @return active True if the current time is within the claim window.
    function isActive() external view returns (bool active);

    /// @notice Returns the time remaining until the airdrop starts (if not started) or ends (if active).
    /// @return timeRemaining The number of seconds remaining, 0 if ended.
    function getTimeRemaining() external view returns (uint256 timeRemaining);
}
