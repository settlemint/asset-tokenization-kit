// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title IClaimStrategy
 * @dev Interface for custom claim strategies that can be plugged into the CustomizableAirdrop
 */
interface IClaimStrategy {
    /**
     * @notice Records that a certain amount has been claimed by an account.
     * @dev Called by the main Airdrop contract AFTER tokens have been transferred.
     * Used to keep the strategy's internal state synchronized.
     * @param account Address for whom the claim is recorded
     * @param amountClaimed The amount of tokens that were successfully claimed and transferred
     */
    function recordClaim(address account, uint256 amountClaimed) external;

    /**
     * @notice Determines whether an account is eligible to claim at the moment
     * @param account Address to check eligibility for
     * @return eligible Whether the account is currently eligible to claim
     */
    function isEligibleToClaim(address account) external view returns (bool eligible);

    /**
     * @notice Returns whether this strategy requires multiple claims (e.g., vesting)
     * @return isVesting Whether the strategy supports multiple claims
     */
    function supportsMultipleClaims() external view returns (bool isVesting);

    /**
     * @notice Calculate the amount that can be claimed based on vesting parameters
     * @param account Address of the claimant
     * @param amount Total allocation for this index
     * @param startTimestamp When the vesting started
     * @param alreadyClaimed Amount already claimed
     * @return claimableAmount The amount that can be claimed now
     */
    function calculateClaimableAmount(
        address account,
        uint256 amount,
        uint256 startTimestamp,
        uint256 alreadyClaimed
    )
        external
        view
        returns (uint256 claimableAmount);

    /**
     * @notice Process a batch of claims for an account
     * @param account Address claiming multiple allocations
     */
    function finalizeBatch(address account) external;

    /**
     * @notice Initialize a new claim for vesting
     * @param account Address initializing the claim
     * @param amount Total allocation amount
     * @return initialAmount Amount to transfer immediately (if any)
     */
    function initializeVesting(address account, uint256 amount) external returns (uint256 initialAmount);
}
