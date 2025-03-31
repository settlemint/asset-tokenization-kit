// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC3643 } from "../ERC3643.sol";
import { IERC6372 } from "@openzeppelin/contracts/interfaces/IERC6372.sol";
import { IERC3643CollateralErrors } from "../interfaces/IERC3643CollateralErrors.sol";

/**
 * @title ERC3643Collateral
 * @dev Extension of ERC3643 that limits the supply of tokens based
 * on a collateral amount and time-based expiration.
 *
 * The {collateral} function must be implemented to return the collateral
 * data. This function can call external oracles or use any local storage.
 *
 * This contract implements IERC6372 for time handling and exposes collateral
 * management functionality with appropriate access control.
 */
abstract contract ERC3643Collateral is ERC3643, IERC6372, IERC3643CollateralErrors {
    /**
     * @dev Structure to store collateral proof information
     */
    struct CollateralProof {
        /// @notice The amount of collateral proven
        uint256 amount;
        /// @notice The timestamp when the proof was submitted
        uint48 timestamp;
    }

    // Stores the current collateral proof information
    CollateralProof private _collateralProof;
    // Tracks the last time the collateral was updated
    uint256 private _lastCollateralUpdate;
    // Duration in seconds that collateral remains valid after submission
    uint48 private _liveness;

    /**
     * @dev Emitted when collateral amount is updated
     * @param oldAmount The previous collateral amount
     * @param newAmount The new collateral amount
     * @param timestamp The timestamp when the update occurred
     */
    event CollateralUpdated(uint256 oldAmount, uint256 newAmount, uint256 timestamp);

    /**
     * @dev Sets the value of the `_liveness`. This value is immutable, it can only be
     * set once during construction.
     * @param liveness_ The minimum duration in seconds that collateral remains valid
     */
    constructor(uint48 liveness_) {
        // Store the liveness duration provided during deployment
        _liveness = liveness_;
        // Initialize the last update timestamp to the contract creation time
        _lastCollateralUpdate = block.timestamp;
    }

    /**
     * @notice Returns the minimum liveness duration of collateral in seconds
     * @dev The liveness determines how long collateral proofs remain valid after submission
     * @return The liveness duration in seconds
     */
    function liveness() public view virtual returns (uint48) {
        // Simply return the stored liveness value
        return _liveness;
    }

    /**
     * @dev Internal function to update the liveness parameter
     * @param liveness_ The new liveness duration in seconds
     */
    function _setLiveness(uint48 liveness_) internal virtual {
        // Update the liveness duration - only callable internally
        _liveness = liveness_;
    }

    /**
     * @inheritdoc IERC6372
     * @dev Returns the current timestamp as the clock value
     * @return The current block timestamp as a uint48
     */
    function clock() public view virtual returns (uint48) {
        // Convert the current block timestamp to uint48 and return it
        return uint48(block.timestamp);
    }

    /**
     * @inheritdoc IERC6372
     * @dev Returns the clock mode as a string
     * @return String indicating the clock uses timestamps
     */
    function CLOCK_MODE() public view virtual returns (string memory) {
        // Indicates that this contract uses timestamps for time tracking
        return "mode=timestamp";
    }

    /**
     * @notice Returns the current collateral information
     * @dev This function provides the amount of collateral and when it was last proven
     * @return amount The amount of collateral currently proven
     * @return timestamp The timestamp when the collateral was last proven
     */
    function collateral() public view virtual returns (uint256 amount, uint48 timestamp) {
        // Return both the amount and timestamp from the stored collateral proof
        return (_collateralProof.amount, _collateralProof.timestamp);
    }

    /**
     * @notice Returns the timestamp of the last collateral update
     * @dev This can be used to determine how fresh the collateral information is
     * @return The timestamp when collateral was last updated
     */
    function lastCollateralUpdate() public view returns (uint256) {
        // Return the stored timestamp of the last collateral update
        return _lastCollateralUpdate;
    }

    /**
     * @notice Updates the collateral amount
     * @dev Only accounts with AUDIT_ROLE can update collateral
     * The provided amount must be greater than or equal to the current total supply
     * @param amount The new collateral amount to set
     */
    function updateCollateral(uint256 amount) internal virtual onlyRole(AUDIT_ROLE) {
        // Check that the new collateral amount is sufficient to cover existing tokens
        if (amount < totalSupply()) {
            revert ERC3643InsufficientCollateral(totalSupply(), amount);
        }

        // Store the old amount for the event emission
        uint256 oldAmount = _collateralProof.amount;

        // Update the collateral proof with new amount and current timestamp
        _collateralProof = CollateralProof({ amount: amount, timestamp: uint48(block.timestamp) });
        // Update the last collateral update timestamp
        _lastCollateralUpdate = block.timestamp;

        // Emit event with old amount, new amount, and timestamp
        emit CollateralUpdated(oldAmount, amount, block.timestamp);
    }

    /**
     * @dev Overrides the _update function to add collateral validation checks
     * When tokens are minted (from == address(0)), this ensures:
     * 1. The collateral has not expired based on the liveness period
     * 2. The total supply does not exceed the proven collateral amount
     * @param from The address tokens are transferred from (address(0) for minting)
     * @param to The address tokens are transferred to
     * @param value The amount of tokens being transferred
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        // First perform the standard token transfer/mint/burn logic from the parent contract
        super._update(from, to, value);

        // For minting operations (tokens created from zero address)
        if (from == address(0)) {
            // Retrieve current collateral information
            (uint256 amount, uint48 timestamp) = collateral();

            // Calculate when the collateral proof expires
            uint48 expiration = timestamp + liveness();

            // Check if the collateral proof has expired
            if (expiration < clock()) {
                revert ERC3643CollateralExpired(timestamp, expiration);
            }

            // Get the current total supply after minting
            uint256 supply = totalSupply();

            // Check if the total supply would exceed collateral amount
            if (supply > amount) {
                revert ERC3643CollateralExceeded(supply, amount);
            }
        }
    }
}
