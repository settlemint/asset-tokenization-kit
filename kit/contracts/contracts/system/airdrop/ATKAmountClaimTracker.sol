// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { IATKClaimTracker } from "./IATKClaimTracker.sol";

/// @title ATK Amount Claim Tracker
/// @author SettleMint Tokenization Services
/// @notice Implementation of partial claim tracking using amount mappings for ATK airdrop contracts.
/// @dev This contract implements claim tracking for airdrops where users can claim portions of their
///      allocation over time. It tracks the cumulative amount claimed for each index without performing
///      validation - validation is handled by the calling airdrop contracts.
///
///      This implementation is optimized for scenarios requiring partial claims and progressive distributions.
contract ATKAmountClaimTracker is IATKClaimTracker {
    // --- Storage Variables ---

    /// @notice Mapping to track already claimed amounts for each index.
    /// @dev Maps claim index to the cumulative amount claimed for that index.
    mapping(uint256 => uint256) private _claimedAmounts;

    // --- View Functions ---

    /// @notice Checks if a claim has been fully claimed for a specific index.
    /// @dev A claim is considered fully claimed when the claimed amount equals or exceeds the total amount.
    /// @param index The index to check in the Merkle tree.
    /// @param totalAmount The total amount allocated for this index.
    /// @return claimed True if the index has been fully claimed, false otherwise.
    function isClaimed(uint256 index, uint256 totalAmount) external view override returns (bool claimed) {
        return _claimedAmounts[index] >= totalAmount;
    }

    /// @notice Gets the amount already claimed for a specific index.
    /// @param index The index to check.
    /// @return claimedAmount The cumulative amount already claimed for this index.
    function getClaimedAmount(uint256 index) external view override returns (uint256 claimedAmount) {
        return _claimedAmounts[index];
    }

    /// @notice Records a claim for a specific index.
    /// @param index The index of the claim in the Merkle tree.
    /// @param claimedAmount The amount being claimed.
    /// @param totalAmount The total amount allocated for this index.
    function recordClaim(uint256 index, uint256 claimedAmount, uint256 totalAmount) external override {
        _claimedAmounts[index] += claimedAmount;
        emit ClaimRecorded(index, claimedAmount, totalAmount);
    }

    /// @notice Checks if a new claim amount is valid for a specific index.
    /// @param index The index to check.
    /// @param claimAmount The amount being claimed.
    /// @param totalAmount The total amount allocated for this index.
    /// @return isValid True if the new claim amount is valid, false otherwise.
    function isClaimAmountValid(
        uint256 index,
        uint256 claimAmount,
        uint256 totalAmount
    )
        external
        view
        override
        returns (bool isValid)
    {
        return _claimedAmounts[index] + claimAmount <= totalAmount;
    }
}
