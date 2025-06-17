// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

/// @title IATKVestingStrategy
/// @author SettleMint Tokenization Services
/// @notice Interface for vesting strategy implementations in ATK vesting airdrop contracts.
/// @dev This interface allows for different vesting calculation strategies (e.g., linear, cliff-based).
///      Implementations should be stateless and calculate claimable amounts based on provided parameters.
interface IATKVestingStrategy {
    // --- External Functions ---

    /// @notice Calculates the amount claimable based on the strategy's vesting parameters.
    /// @param account The address of the claimant.
    /// @param totalAmount The total allocation for the specific index being claimed.
    /// @param vestingStartTime The timestamp when vesting started for this allocation.
    /// @param claimedAmount The amount already claimed for this specific index.
    /// @return claimableAmount The amount that can be claimed now.
    function calculateClaimableAmount(
        address account,
        uint256 totalAmount,
        uint256 vestingStartTime,
        uint256 claimedAmount
    )
        external
        view
        returns (uint256 claimableAmount);

    /// @notice Returns whether this strategy supports multiple claims (vesting).
    /// @return supportsMultiple True if the strategy supports multiple claims over time.
    function supportsMultipleClaims() external pure returns (bool supportsMultiple);
}
