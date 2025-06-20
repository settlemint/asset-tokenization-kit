// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

/// @notice Indicates that an operation was attempted with the zero address (address(0))
///         where a valid, non-zero address was expected.
/// @dev This error is commonly used to prevent critical functions from being called with an uninitialized
///      or invalid address parameter, which could lead to locked funds or unexpected behavior.
///      For example, it might be reverted if trying to create an identity for the zero address
///      or assign ownership to the zero address.
error ZeroAddressNotAllowed();
