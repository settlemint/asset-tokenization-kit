// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

/// @dev Thrown when the address is not an ERC20.
/// @param token address of the token.
error AddressNotERC20(address token);

/// @dev Thrown when limits array size exceeded.
/// @param _compliance compliance contract address.
/// @param _arraySize array size.
error LimitsArraySizeExceeded(address _compliance, uint256 _arraySize);

/// @dev Thrown when invalid decimals is set.
/// @param _decimals number of decimals
error DecimalsOutOfRange(uint256 _decimals);

/// @dev Thrown when the string passed is empty.
error EmptyString();

/// @dev Thrown when token amount is zero.
error ZeroValue();

/// @dev Thrown when the address passed is the zero address.
error ZeroAddress();
