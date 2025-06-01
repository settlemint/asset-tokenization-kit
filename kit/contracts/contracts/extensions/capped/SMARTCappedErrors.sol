// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Custom Errors for the SMART Capped Token Extension
/// @notice This file defines custom errors specific to the capped supply functionality.
///         Using custom errors in Solidity (introduced in version 0.8.4) is generally more gas-efficient
///         than using `require` statements with string messages, and allows for more structured error reporting.

/// @notice Error: Minting would exceed the maximum token supply cap.
/// @dev This error is thrown when a mint operation (creating new tokens) is attempted, but the
///      resulting total supply would be greater than the pre-defined `cap`.
///      For example, if the cap is 1,000,000 tokens and current supply is 990,000, attempting to mint
///      20,000 more tokens would trigger this error because 990,000 + 20,000 = 1,010,000, which is > 1,000,000.
/// @param newSupply The total supply that *would have resulted* if the mint operation had proceeded.
/// @param cap The hard-coded maximum allowed total supply for the token.
error SMARTExceededCap(uint256 newSupply, uint256 cap);

/// @notice Error: An invalid cap value was provided during initialization.
/// @dev This error is typically thrown by the constructor or initializer of a capped token extension
///      if the provided `cap` value is not valid. The most common invalid value is zero, as a cap of zero
///      would mean no tokens could ever be minted.
/// @param cap The invalid cap value that was attempted to be set during initialization (e.g., 0).
error SMARTInvalidCap(uint256 cap);
