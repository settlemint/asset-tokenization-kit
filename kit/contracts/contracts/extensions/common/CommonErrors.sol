// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Common Custom Errors for SMART Extensions
/// @notice This file defines custom errors that are commonly used across various SMART token extensions.
///         Using custom errors (available since Solidity 0.8.4) is a more gas-efficient way to provide
///         reasons for failed transactions compared to `require` statements with string messages.
///         They also allow for more structured error data to be returned to the caller.

/// @notice Error: Array Length Mismatch in Batch Operation.
/// @dev This error is typically triggered in functions that process multiple items in batches,
///      such as `batchBurn` or `batchTransfer`, when the input arrays (e.g., an array of addresses
///      and an array of corresponding amounts) do not have the same number of elements.
///      For example, if 3 addresses are provided but only 2 amounts, this error would be raised
///      because it's unclear how to map the amounts to the addresses.
error LengthMismatch();

/// @notice Error: Zero Address Not Allowed.
/// @dev This error is used to indicate that an operation or initialization was attempted with the
///      zero address (`address(0)`), which is often an invalid or disallowed address in many contexts.
///      For example, setting a critical administrative role to the zero address, or transferring tokens
///      to the zero address (which can effectively burn them, but should be explicit if intended).
error ZeroAddressNotAllowed();

/// @notice Error indicating that the provided lost wallet is not marked as lost.
/// @dev This can occur if the wallet is not associated with any lost identity.
error InvalidLostWallet();

/// @notice Error indicating that there are no tokens to recover.
/// @dev This can occur if the contract holds no tokens to recover.
error NoTokensToRecover();

/// @notice Error indicating an attempt to recover the token contract's own tokens.
/// @dev The `recoverERC20` function is designed to recover other ERC20 tokens mistakenly sent to this contract,
///      not the token this contract itself represents.
error CannotRecoverSelf();
