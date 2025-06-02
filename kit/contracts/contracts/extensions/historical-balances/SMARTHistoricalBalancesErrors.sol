// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Custom Errors for SMART Historical Balances Extension
/// @notice Defines custom errors specific to the historical balances functionality.
/// @dev Using custom errors is more gas-efficient than `require` statements with string messages in Solidity.

/**
 * @notice Error reverted when a historical data lookup (e.g., `balanceOfAt`, `totalSupplyAt`) is attempted
 *         for a `timepoint` that is in the future or is the current `timepoint`.
 * @dev Historical data is only available for past timepoints. The `clock()` function in the implementing
 *      contract determines the current reference timepoint.
 * @param requestedTimepoint The future timepoint (e.g., block number) that was invalidly requested.
 * @param currentTimepoint The current valid timepoint (e.g., current block number) according to the contract's
 * `clock()`.
 */
error FutureLookup(uint256 requestedTimepoint, uint48 currentTimepoint);
