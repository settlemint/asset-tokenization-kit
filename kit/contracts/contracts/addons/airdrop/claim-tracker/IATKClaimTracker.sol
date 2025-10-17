// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

/// @title IATKClaimTracker
/// @author SettleMint
/// @notice Interface for claim tracking strategies in ATK airdrop contracts.
/// @dev This interface allows for different claim tracking implementations (e.g., bitmap, storage-based).
///      Implementations should handle partial and full claims efficiently.
interface IATKClaimTracker {
    // --- Events ---

    /// @notice Emitted when a claim is recorded for a specific index.
    /// @param index The index of the claim in the Merkle tree.
    /// @param claimedAmount The amount claimed.
    /// @param totalAmount The total amount allocated for this index.
    event ClaimRecorded(uint256 indexed index, uint256 indexed claimedAmount, uint256 indexed totalAmount);

    /// @notice Checks if a claim has been fully claimed for a specific index.
    /// @param index The index to check in the Merkle tree.
    /// @param totalAmount The total amount allocated for this index.
    /// @return claimed True if the index has been fully claimed, false otherwise.
    function isClaimed(uint256 index, uint256 totalAmount) external view returns (bool claimed);

    /// @notice Records a claim for a specific index.
    /// @param index The index of the claim in the Merkle tree.
    /// @param claimedAmount The amount being claimed.
    /// @param totalAmount The total amount allocated for this index.
    function recordClaim(uint256 index, uint256 claimedAmount, uint256 totalAmount) external;

    /// @notice Gets the amount already claimed for a specific index.
    /// @param index The index to check.
    /// @return claimedAmount The amount already claimed for this index.
    function getClaimedAmount(uint256 index) external view returns (uint256 claimedAmount);

    /// @notice Checks if a new claim amount is valid for a specific index.
    /// @param index The index to check.
    /// @param claimedAmount The amount being claimed.
    /// @param totalAmount The total amount allocated for this index.
    /// @return isValid True if the new claim amount is valid, false otherwise.
    function isClaimAmountValid(uint256 index, uint256 claimedAmount, uint256 totalAmount)
        external
        view
        returns (bool isValid);
}
