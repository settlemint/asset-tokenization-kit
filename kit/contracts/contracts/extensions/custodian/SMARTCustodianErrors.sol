// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Custom Errors for SMART Custodian Extension
/// @notice Defines custom errors specific to the custodian functionalities like freezing, recovery, and transfers.
/// @dev Using custom errors is more gas-efficient than `require` statements with string messages.

/// @notice Error indicating that the amount requested to be frozen exceeds the user's available (unfrozen) balance.
/// @param available The available, unfrozen balance of the user.
/// @param requested The amount of tokens requested to be frozen.
error FreezeAmountExceedsAvailableBalance(uint256 available, uint256 requested);

/// @notice Error indicating that an attempt to unfreeze or use frozen tokens failed because the
///         amount requested exceeds the currently frozen token balance for the address.
/// @param frozenBalance The current amount of tokens specifically frozen for the address.
/// @param requested The amount requested to be unfrozen or used from the frozen portion.
error InsufficientFrozenTokens(uint256 frozenBalance, uint256 requested);

/// @notice Error indicating that a recovery operation was attempted on a wallet with a zero token balance.
error NoTokensToRecover();

/// @notice Error indicating that an operation (e.g., mint, transfer) cannot proceed because the recipient address is
/// frozen.
error RecipientAddressFrozen();

/// @notice Error indicating that an operation (e.g., transfer, burn, redeem) cannot proceed because the sender address
/// is frozen.
error SenderAddressFrozen();
