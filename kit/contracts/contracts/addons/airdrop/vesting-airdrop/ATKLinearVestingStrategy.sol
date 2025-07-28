// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { IATKLinearVestingStrategy } from "./IATKLinearVestingStrategy.sol";

/// @title ATK Linear Vesting Strategy
/// @author SettleMint
/// @notice Implementation of a linear vesting calculation strategy for ATK airdrop contracts.
/// @dev This contract implements stateless linear vesting calculations with configurable duration and cliff.
///      The vesting parameters (duration, cliff) are set at deployment and cannot be changed.
///      It holds no state about users; all user-specific data is passed in during calculations.
contract ATKLinearVestingStrategy is IATKLinearVestingStrategy {
    /// @notice Type identifier for this vesting strategy contract
    bytes32 public constant TYPE_ID = keccak256("ATKLinearVestingStrategy");

    // --- Storage Variables ---

    /// @notice The total duration of the vesting period in seconds.
    /// @dev Set once at construction and immutable thereafter.
    uint256 public immutable VESTING_DURATION;

    /// @notice The cliff duration before any tokens can be claimed, in seconds.
    /// @dev Set once at construction and immutable thereafter. Must be <= VESTING_DURATION.
    uint256 public immutable CLIFF_DURATION;

    // --- Constructor ---

    /// @notice Initializes the linear vesting strategy with specified parameters.
    /// @dev Sets the vesting duration and cliff duration. Both are immutable after deployment.
    /// @param vestingDuration_ The total vesting duration in seconds (must be > 0).
    /// @param cliffDuration_ The initial cliff duration in seconds (must be <= vestingDuration_).
    constructor(uint256 vestingDuration_, uint256 cliffDuration_) {
        if (vestingDuration_ == 0) revert InvalidVestingDuration();
        if (cliffDuration_ > vestingDuration_) revert CliffExceedsVestingDuration();

        VESTING_DURATION = vestingDuration_;
        CLIFF_DURATION = cliffDuration_;
    }

    // --- View Functions ---

    /// @notice Returns the total vesting duration.
    /// @return The vesting duration in seconds.
    function vestingDuration() external view returns (uint256) {
        return VESTING_DURATION;
    }

    /// @notice Returns the cliff duration.
    /// @return The cliff duration in seconds.
    function cliffDuration() external view returns (uint256) {
        return CLIFF_DURATION;
    }

    // --- External Functions ---

    /// @notice Calculates the amount claimable based on linear vesting parameters.
    /// @dev Implements linear vesting with optional cliff period. No tokens are claimable before cliff.
    ///      After cliff, tokens vest linearly until the full vesting duration is reached.
    ///      The first parameter (account) is unused but kept for interface compatibility.
    /// @param totalAmount The total allocation for the specific index being claimed.
    /// @param vestingStartTime The timestamp when vesting started for this allocation.
    /// @param claimedAmount The amount already claimed for this specific index.
    /// @return claimableAmount The amount that can be claimed now.
    // solhint-disable-next-line use-natspec
    function calculateClaimableAmount(
        address, /* account - unused */
        uint256 totalAmount,
        uint256 vestingStartTime,
        uint256 claimedAmount
    )
        external
        view
        override
        returns (uint256 claimableAmount)
    {
        // Calculate time elapsed since vesting started
        uint256 timeElapsed = block.timestamp - vestingStartTime;

        // Nothing vested before cliff period ends
        if (timeElapsed < CLIFF_DURATION) {
            return 0;
        }

        // Calculate vested amount for this specific index's allocation
        uint256 vestedAmountForIndex;
        if (timeElapsed > VESTING_DURATION - 1) {
            // All tokens for this index are fully vested
            vestedAmountForIndex = totalAmount;
        } else {
            // Linear vesting calculation for this index
            // Safe division: VESTING_DURATION is checked > 0 in constructor
            vestedAmountForIndex = (totalAmount * timeElapsed) / VESTING_DURATION;
        }

        // Ensure vested amount doesn't exceed the index's total amount due to potential rounding
        if (vestedAmountForIndex > totalAmount) {
            vestedAmountForIndex = totalAmount;
        }

        // Return claimable amount (vested for this index minus already claimed for this index)
        claimableAmount = vestedAmountForIndex > claimedAmount ? vestedAmountForIndex - claimedAmount : 0;

        return claimableAmount;
    }

    /// @notice Returns whether this strategy supports multiple claims over time.
    /// @dev Linear vesting requires multiple claims as tokens become available gradually.
    /// @return supportsMultiple Always true for linear vesting strategy.
    function supportsMultipleClaims() external pure override returns (bool supportsMultiple) {
        return true;
    }

    /// @notice Returns the unique type identifier for this contract.
    /// @return The unique type identifier as a bytes32 hash
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }
}
