// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Custom Errors for SMART Core Extension
/// @notice Defines custom errors used within the SMART core token logic.
/// @dev Custom errors are more gas-efficient than `require` statements with string messages.
///      They provide a way to signal failure conditions with specific details.

/// @notice Error indicating that the provided decimals value is invalid.
/// @param decimals The invalid decimals value that was provided.
/// @dev This error is typically reverted if `decimals` is greater than 18, which is a common upper limit.
error InvalidDecimals(uint8 decimals);

/// @notice Error indicating that a compliance module is being added but already exists.
/// @param module The address of the duplicate compliance module.
error DuplicateModule(address module);

/// @notice Error indicating that a mint operation failed compliance checks.
/// @dev This means the conditions required by the active compliance modules for minting were not met.
error MintNotCompliant();

/// @notice Error indicating that a transfer operation failed compliance checks.
/// @dev This means the conditions required by the active compliance modules for transferring tokens were not met.
error TransferNotCompliant();

/// @notice Error indicating that an attempt was made to add a compliance module that is already registered.
error ModuleAlreadyAdded();

/// @notice Error indicating that a specified compliance module was not found.
/// @dev This can occur when trying to remove or update parameters for a non-existent module.
error ModuleNotFound();

/// @notice Error indicating that the token balance is insufficient for an operation.
/// @dev This typically occurs during token recovery if the contract holds less of the target token than the amount
/// requested for recovery.
error InsufficientTokenBalance();
