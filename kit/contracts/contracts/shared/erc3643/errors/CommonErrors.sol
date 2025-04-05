// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

/// @dev Thrown when initialization has failed.
error InitializationFailed();

/// @dev Thrown when the implementation authority is invalid.
error InvalidImplementationAuthority();

/// @dev We must use OpenZeppelin libs when upgrading to v >= 5 for errors below

/**
 * @dev The caller account is not authorized to perform an operation.
 */
error OwnableUnauthorizedAccount(address account);

/**
 * @dev Indicates a failure with the `spender`’s `allowance`. Used in transfers.
 * @param spender Address that may be allowed to operate on tokens without being their owner.
 * @param allowance Amount of tokens a `spender` is allowed to operate with.
 * @param needed Minimum amount required to perform a transfer.
 */
error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);

/**
 * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
 * @param sender Address whose tokens are being transferred.
 * @param balance Current balance for the interacting account.
 * @param needed Minimum amount required to perform a transfer.
 */
error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

/**
 * @dev Indicates a failure with the token `receiver`. Used in transfers.
 * @param receiver Address to which tokens are being transferred.
 */
error ERC20InvalidReceiver(address receiver);

/**
 * @dev Indicates a failure with the token `sender`. Used in transfers.
 * @param sender Address whose tokens are being transferred.
 */
error ERC20InvalidSender(address sender);

/**
 * @dev Indicates a failure with the `spender` to be approved. Used in approvals.
 * @param spender Address that may be allowed to operate on tokens without being their owner.
 */
error ERC20InvalidSpender(address spender);

/**
 * @dev The operation failed because the contract is paused.
 */
error EnforcedPause();

/**
 * @dev The operation failed because the contract is not paused.
 */
error ExpectedPause();

/**
 * @dev The operation failed because the input array is too big.
 * @param _maxSize maximum size for the array.
 */
error ArraySizeLimited(uint256 _maxSize);
