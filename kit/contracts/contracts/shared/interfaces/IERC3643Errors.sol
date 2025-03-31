// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

/**
 * @title IERC3643Errors
 * @dev Interface defining custom errors for the ERC3643 token standard
 * These errors are thrown throughout the token implementation when validations fail
 */
interface IERC3643Errors {
    /**
     * @notice Error thrown when attempting to set an invalid onchain ID
     * @dev Used to validate that onchain ID cannot be the zero address
     * @param onchainID The invalid onchain ID that caused this error
     */
    error ERC3643InvalidOnchainID(address onchainID);

    /**
     * @notice Error thrown when attempting to set invalid decimals
     * @dev Used to validate that decimals are not greater than 18
     * @param decimals The invalid decimals value that caused this error
     */
    error ERC3643InvalidDecimals(uint8 decimals);

    /**
     * @notice Error thrown when attempting to set an empty name
     * @dev Used to validate that the name is not empty
     */
    error ERC3643EmptyName();

    /**
     * @notice Error thrown when attempting to set an empty symbol
     * @dev Used to validate that the symbol is not empty
     */
    error ERC3643EmptySymbol();

    /**
     * @notice Error thrown when a user doesn't have enough unfrozen tokens for an operation
     * @dev Used during transfers to ensure users have sufficient available balance
     * @param user Address that has insufficient unfrozen balance
     */
    error ERC3643InsufficientUnfrozenBalance(address user);

    /**
     * @notice Error thrown when attempting to unfreeze more tokens than are frozen
     * @dev Used during the unfreeze operation to prevent unfreezing excess tokens
     * @param user Address that has insufficient frozen balance
     */
    error ERC3643InsufficientFrozenBalance(address user);

    /**
     * @notice Error thrown when attempting to freeze an already frozen address
     * @dev Prevents redundant freeze operations on addresses that are already frozen
     * @param user Address that is already frozen
     */
    error ERC3643AddressAlreadyFrozen(address user);

    /**
     * @notice Error thrown when attempting to recover tokens from a lost wallet with zero balance
     * @dev Prevents unnecessary recovery attempts when there are no tokens to recover
     * @param lostWallet Address that lost tokens
     */
    error ERC3643NoTokensToRecover(address lostWallet);

    /**
     * @notice Error thrown when attempting to recover tokens but recovery is not possible
     * @dev This can occur when recovery prerequisites are not met or the recovery system is disabled
     */
    error ERC3643RecoveryNotPossible();

    /**
     * @notice Error thrown when attempting an operation while the contract is paused
     * @dev Used to block operations that should not be executed during a pause state
     */
    error ERC3643EnforcedPause();

    /**
     * @notice Error thrown when attempting a pause-only operation while the contract is not paused
     * @dev Used for operations that should only be executed during a pause state
     */
    error ERC3643ExpectedPause();

    /**
     * @notice Error thrown when an operation references an invalid token address
     * @dev Used to validate token addresses in operations that interact with other tokens
     * @param token The invalid token address that caused this error
     */
    error ERC3643InvalidToken(address token);

    /**
     * @notice Error thrown when an operation references an invalid receiver address
     * @dev Used to validate receiver addresses in transfer and similar operations
     * @param receiver The invalid receiver address that caused this error
     */
    error ERC3643InvalidReceiver(address receiver);

    /**
     * @notice Error thrown when a token balance is insufficient for an operation
     * @dev Used to validate that token balances are sufficient for operations like transfers
     * @param token The token address being checked
     * @param balance The current balance available
     * @param amount The amount that was attempted to be used
     */
    error ERC3643InsufficientTokenBalance(address token, uint256 balance, uint256 amount);
}
