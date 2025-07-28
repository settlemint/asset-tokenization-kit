// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for SMART Historical Balances Extension
/// @author SettleMint
/// @notice Defines the external functions for querying historical token balances and total
/// supply.
/// @dev This interface allows other contracts or off-chain applications to retrieve the balance of an account
///      or the total supply of the token at a specific past timepoint (e.g., block number).
///      A Solidity 'interface' is a contract blueprint that only declares function signatures without providing
///      their implementation. Contracts that 'implement' this interface must provide the defined functions.
interface ISMARTHistoricalBalances {
    /// @notice Error reverted when a historical data lookup (e.g., `balanceOfAt`, `totalSupplyAt`) is attempted
    ///         for a `timepoint` that is in the future or is the current `timepoint`.
    /// @dev Historical data is only available for past timepoints. The `clock()` function in the implementing
    ///      contract determines the current reference timepoint.
    /// @param requestedTimepoint The future timepoint (e.g., block number) that was invalidly requested.
    /// @param currentTimepoint The current valid timepoint (e.g., current block number) according to the contract's
    /// `clock()`.
    error FutureLookup(uint256 requestedTimepoint, uint48 currentTimepoint);

    /// @notice Emitted when a new checkpoint is written for an account's balance or for the total supply
    ///         due to a token operation (mint, burn, transfer).
    /// @dev This event signals that a historical data point has been recorded.
    ///      Off-chain services can listen to this event to know when to update their own historical data caches
    ///      or to trigger other actions based on balance changes.
    /// @param sender The address that initiated the token operation (e.g., minter, transferer, burner)
    ///               which resulted in this checkpoint update. `indexed` for easier filtering.
    /// @param account The address for which a balance checkpoint was created. If this is `address(0)`,
    ///                it signifies that the checkpoint is for the token's `totalSupply`.
    ///                `indexed` for tracking specific accounts or total supply updates.
    /// @param oldBalance The balance (either of `account` or `totalSupply`) *before* the operation that triggered
    ///                   the checkpoint.
    /// @param newBalance The balance (either of `account` or `totalSupply`) *after* the operation and at the
    ///                   time of this checkpoint.
    event CheckpointUpdated(
        address indexed sender, address indexed account, uint256 indexed oldBalance, uint256 newBalance
    );

    /// @notice Returns the token balance of a specific `account` at a given `timepoint`.
    /// @dev The `timepoint` usually refers to a block number in the past. Implementations should revert
    ///      if a `timepoint` in the future (or the current timepoint) is queried.
    ///      `view` functions do not modify state and do not consume gas when called externally.
    /// @param account The address of the account whose historical balance is being queried.
    /// @param timepoint The specific past timepoint (e.g., block number) to retrieve the balance for.
    /// @return uint256 The token balance of `account` at the specified `timepoint`.
    function balanceOfAt(address account, uint256 timepoint) external view returns (uint256);

    /// @notice Returns the total token supply at a given `timepoint`.
    /// @dev Similar to `balanceOfAt`, `timepoint` refers to a past block number. Implementations should
    ///      revert for future or current timepoints.
    /// @param timepoint The specific past timepoint (e.g., block number) to retrieve the total supply for.
    /// @return uint256 The total token supply at the specified `timepoint`.
    function totalSupplyAt(uint256 timepoint) external view returns (uint256);
}
