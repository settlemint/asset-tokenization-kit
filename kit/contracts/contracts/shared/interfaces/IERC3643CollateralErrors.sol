// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

/**
 * @title IERC3643CollateralErrors
 * @dev Interface defining custom errors related to collateral functionality in ERC3643
 * These errors are thrown when collateral-related validations fail
 */
interface IERC3643CollateralErrors {
    /**
     * @notice Error thrown when token supply exceeds collateral cap
     * @dev This error occurs during minting when the resulting total supply would exceed
     * the proven collateral amount, ensuring token value is backed by sufficient collateral
     * @param increasedSupply The total supply after the attempted mint operation
     * @param cap The maximum amount of tokens allowed based on proven collateral
     */
    error ERC3643CollateralExceeded(uint256 increasedSupply, uint256 cap);

    /**
     * @notice Error thrown when collateral proof has expired
     * @dev This error occurs when attempting to mint tokens with an expired collateral proof
     * The collateral is considered expired when the current time exceeds timestamp + liveness
     * @param timestamp The timestamp when the collateral proof was submitted
     * @param expiration The calculated expiration time (timestamp + liveness)
     */
    error ERC3643CollateralExpired(uint48 timestamp, uint48 expiration);

    /**
     * @notice Error thrown when collateral amount is insufficient
     * @dev This error occurs when attempting to update collateral to an amount less than
     * the current total supply of tokens, ensuring collateral always covers all tokens
     * @param required The minimum amount of collateral needed (current total supply)
     * @param provided The insufficient collateral amount that was attempted to be set
     */
    error ERC3643InsufficientCollateral(uint256 required, uint256 provided);
}
