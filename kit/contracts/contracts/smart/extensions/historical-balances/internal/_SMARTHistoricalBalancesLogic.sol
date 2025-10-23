// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { _SMARTExtension } from "../../common/_SMARTExtension.sol";
import { ISMARTHistoricalBalances } from "../ISMARTHistoricalBalances.sol";

import { Checkpoints } from "@openzeppelin/contracts/utils/structs/Checkpoints.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";

/// @title Internal Core Logic for SMART Historical Balances Extension
/// @author SettleMint
/// @notice This abstract contract provides the foundational mechanisms for tracking historical
/// token balances
///         for individual accounts and the historical total supply of the token.
/// @dev It utilizes OpenZeppelin's `Checkpoints.Trace208` library to store and retrieve historical data points.
///      The contract defines how checkpoints are created after mint, burn, and transfer operations via internal
///      `__historical_balances_...Logic` functions, which are intended to be called by `SMARTHooks` in the
///      concrete implementations (`SMARTHistoricalBalances.sol` and `SMARTHistoricalBalancesUpgradeable.sol`).
///      An 'abstract contract' is a base contract that may have unimplemented parts and cannot be deployed directly.
///      It must be inherited by another contract that provides any missing implementations.
///      Key features:
///      - `_balanceCheckpoints`: Mapping to store `Checkpoints.Trace208` for each account.
///      - `_totalSupplyCheckpoints`: A single `Checkpoints.Trace208` for the token's total supply.
///      - `clock()`: Defines the time source for checkpoints (defaults to `block.timestamp`).
///      - `balanceOfAt()` and `totalSupplyAt()`: Public view functions to query historical data.
///      - `_writeCheckpointAdd()` and `_writeCheckpointSubtract()`: Internal helpers for updating checkpoints.
abstract contract _SMARTHistoricalBalancesLogic is _SMARTExtension, ISMARTHistoricalBalances {
    using Checkpoints for Checkpoints.Trace208;

    // -- State Variables --

    /// @notice Mapping from an account address to its historical balance checkpoints.
    /// @dev Each `Checkpoints.Trace208` struct stores a history of balance values for the specific `account`.
    ///      `private` visibility restricts access to this contract only. Child contracts will interact
    ///      via the provided internal and public functions.
    mapping(address account => Checkpoints.Trace208 checkpoints) private _balanceCheckpoints;

    /// @notice Historical checkpoints for the token's total supply.
    /// @dev A single `Checkpoints.Trace208` struct tracks changes to the total supply over time.
    Checkpoints.Trace208 private _totalSupplyCheckpoints;

    // -- Internal Setup Function --

    /// @notice Internal initializer function for the historical balances logic.
    /// @dev This function should be called ONLY ONCE during the setup of the concrete historical balances
    ///      extension (either in its constructor or initializer).
    ///      Its main purpose is to register the `ISMARTHistoricalBalances` interface ID using
    ///      `_registerInterface` (from `_SMARTExtension`). This enables ERC165 introspection, allowing other
    ///      contracts to discover that this token supports historical balance queries.
    function __SMARTHistoricalBalances_init_unchained() internal {
        _registerInterface(type(ISMARTHistoricalBalances).interfaceId);
    }

    // -- Timekeeping --

    /// @notice Returns the current timepoint value used for creating new checkpoints.
    /// @dev By default, this implementation uses `block.timestamp` (the timestamp of the current block)
    ///      casted to `uint48`. `uint48` is chosen by OpenZeppelin's `Checkpoints` as it's sufficient for
    ///      timestamps for many decades and saves storage.
    ///      This function can be overridden in derived contracts if a different time source (e.g., `block.number`)
    ///      is desired, but `block.timestamp` is generally preferred for time-based logic.
    /// @return uint48 The current timepoint (default: `block.timestamp` as `uint48`).
    function clock() public view virtual returns (uint48) {
        return SafeCast.toUint48(block.timestamp); // Uses OZ SafeCast to prevent overflow if timestamp is too large
            // (highly unlikely for uint48).
    }

    // solhint-disable-next-line func-name-mixedcase
    /// @notice Provides a EIP-5267 EIP-2771-compatible machine-readable description of the clock mechanism
    /// @dev For this implementation, it indicates that the `clock()` function uses `block.timestamp`.
    ///      This helps off-chain tools and other contracts understand how time is measured for checkpoints.
    /// @return clockMode A string literal "mode=timestamp"
    function CLOCK_MODE() public view virtual returns (string memory) {
        return "mode=timestamp"; // Conforms to EIP-5267 recommendation
    }

    // -- View Functions (ISMARTHistoricalBalances Implementation) --

    /// @inheritdoc ISMARTHistoricalBalances
    /// @notice Retrieves the token balance of `account` at a specific past `timepoint`.
    /// @dev It uses `_balanceCheckpoints[account].upperLookupRecent()` from OpenZeppelin's `Checkpoints` library.
    ///      `upperLookupRecent` finds the checkpoint value at or before the given `timepoint`.
    ///      Reverts with `FutureLookup` error if `timepoint` is not in the past (i.e., >= `clock()`).
    ///      `timepoint` is cast to `uint48` to match the `Checkpoints` library's timestamp format.
    function balanceOfAt(address account, uint256 timepoint) public view virtual override returns (uint256) {
        uint48 currentTimepoint = clock();
        if (timepoint > currentTimepoint) {
            revert FutureLookup(timepoint, currentTimepoint);
        }
        // `SafeCast.toUint48` ensures the timepoint fits; will revert if timepoint is too large for uint48,
        // though `FutureLookup` would typically catch this first for valid blockchain time values.
        return _balanceCheckpoints[account].upperLookupRecent(SafeCast.toUint48(timepoint));
    }

    /// @inheritdoc ISMARTHistoricalBalances
    /// @notice Retrieves the total token supply at a specific past `timepoint`.
    /// @dev Works similarly to `balanceOfAt`, using `_totalSupplyCheckpoints.upperLookupRecent()`.
    ///      Reverts with `FutureLookup` for non-past timepoints.
    function totalSupplyAt(uint256 timepoint) public view virtual override returns (uint256) {
        uint48 currentTimepoint = clock();
        if (timepoint > currentTimepoint) {
            revert FutureLookup(timepoint, currentTimepoint);
        }
        return _totalSupplyCheckpoints.upperLookupRecent(SafeCast.toUint48(timepoint));
    }

    // -- Hooks Logic (Internal Implementation for SMARTHooks) --
    // These `__historical_balances_...Logic` functions are designed to be called by the `_after<Action>` hooks
    // in the concrete historical balance extension contracts (SMARTHistoricalBalances.sol or ...Upgradeable.sol).

    /// @notice Internal logic to be executed *after* a mint operation.
    /// @dev Updates the historical total supply and the recipient's balance checkpoints.
    ///      `amount` is cast to `uint208` to match `Checkpoints.Trace208` value storage.
    ///      Calls `_writeCheckpointAdd` for both total supply and the recipient's balance.
    ///      Emits a `CheckpointUpdated` event for the recipient's balance change.
    ///      (A `CheckpointUpdated` for total supply could also be emitted if desired).
    /// @param to The address that received the minted tokens.
    /// @param amount The quantity of tokens minted.
    function __historical_balances_afterMintLogic(address to, uint256 amount) internal virtual {
        uint208 castAmount = SafeCast.toUint208(amount); // Max value for ERC20 balances in checkpoints

        _writeCheckpointAdd(_totalSupplyCheckpoints, castAmount); // Update total supply checkpoint
        (uint208 previousBalance, uint208 newBalance) = _writeCheckpointAdd(_balanceCheckpoints[to], castAmount);
        emit ISMARTHistoricalBalances.CheckpointUpdated(_smartSender(), to, previousBalance, newBalance);
    }

    /// @notice Internal logic to be executed *after* a burn operation.
    /// @dev Updates the historical total supply and the burner's balance checkpoints.
    ///      Calls `_writeCheckpointSubtract` for both.
    ///      Emits `CheckpointUpdated` for the burner's balance change.
    /// @param from The address whose tokens were burned.
    /// @param amount The quantity of tokens burned.
    function __historical_balances_afterBurnLogic(address from, uint256 amount) internal virtual {
        uint208 castAmount = SafeCast.toUint208(amount);

        _writeCheckpointSubtract(_totalSupplyCheckpoints, castAmount); // Update total supply checkpoint
        (uint208 previousBalance, uint208 newBalance) = _writeCheckpointSubtract(_balanceCheckpoints[from], castAmount);
        emit ISMARTHistoricalBalances.CheckpointUpdated(_smartSender(), from, previousBalance, newBalance);
    }

    /// @notice Internal logic to be executed *after* a transfer operation.
    /// @dev Updates the historical balance checkpoints for both the sender (`from`) and the recipient (`to`).
    ///      Calls `_writeCheckpointSubtract` for the sender and `_writeCheckpointAdd` for the recipient.
    ///      Emits `CheckpointUpdated` events for both address's balance changes.
    ///      Total supply is unchanged in a transfer, so `_totalSupplyCheckpoints` is not modified here.
    /// @param from The address that sent the tokens.
    /// @param to The address that received the tokens.
    /// @param amount The quantity of tokens transferred.
    function __historical_balances_afterTransferLogic(address from, address to, uint256 amount) internal virtual {
        uint208 castAmount = SafeCast.toUint208(amount);
        address sender = _smartSender(); // Actual initiator of the transfer

        (uint208 previousFromBalance, uint208 newFromBalance) =
            _writeCheckpointSubtract(_balanceCheckpoints[from], castAmount);
        emit ISMARTHistoricalBalances.CheckpointUpdated(sender, from, previousFromBalance, newFromBalance);

        (uint208 previousToBalance, uint208 newToBalance) = _writeCheckpointAdd(_balanceCheckpoints[to], castAmount);
        emit ISMARTHistoricalBalances.CheckpointUpdated(sender, to, previousToBalance, newToBalance);
    }

    // -- Internal Helper Functions for Checkpoint Writing --

    /// @notice Internal helper to write a new checkpoint by adding a `delta` to a `Checkpoints.Trace208` store.
    /// @dev It retrieves the latest value, adds the `delta`, and pushes the new value with the current `clock()`
    ///      timepoint to the specified `store`.
    ///      Solidity 0.8+ provides automatic overflow/underflow checks for arithmetic.
    /// @param store A storage pointer to the `Checkpoints.Trace208` struct to be updated.
    /// @param delta The positive change in value to be added to the latest checkpoint value.
    /// @return previousValue The value stored in the checkpoint *before* this update.
    /// @return newValue The value stored in the checkpoint *after* this update.
    function _writeCheckpointAdd(
        Checkpoints.Trace208 storage store,
        uint208 delta
    )
        private
        returns (uint208 previousValue, uint208 newValue)
    {
        previousValue = store.latest();
        newValue = previousValue + delta; // Relies on Solidity 0.8+ overflow check
        store.push(clock(), newValue);
        return (previousValue, newValue);
    }

    /// @notice Internal helper to write a new checkpoint by subtracting a `delta` from a `Checkpoints.Trace208` store.
    /// @dev Similar to `_writeCheckpointAdd`, but subtracts the `delta`.
    /// @param store A storage pointer to the `Checkpoints.Trace208` struct.
    /// @param delta The positive change in value to be subtracted from the latest checkpoint value.
    /// @return previousValue The value before this update.
    /// @return newValue The value after this update.
    function _writeCheckpointSubtract(
        Checkpoints.Trace208 storage store,
        uint208 delta
    )
        private
        returns (uint208 previousValue, uint208 newValue)
    {
        previousValue = store.latest();
        newValue = previousValue - delta; // Relies on Solidity 0.8+ underflow check
        store.push(clock(), newValue);
        return (previousValue, newValue);
    }
}
